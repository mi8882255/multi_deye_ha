import { describe, it, expect, vi } from 'vitest';
import { InverterState } from '../../../src/core/inverter/inverter-state.js';
import { Sensor } from '../../../src/core/sensors/sensor.js';

describe('InverterState', () => {
  const sensors = [
    new Sensor({
      id: 'pv1_power',
      name: 'PV1 Power',
      address: 674,
      size: 1,
      factor: 1,
      unit: 'W',
      signed: false,
      deviceClass: 'power',
      stateClass: 'measurement',
    }),
    new Sensor({
      id: 'pv1_voltage',
      name: 'PV1 Voltage',
      address: 672,
      size: 1,
      factor: 0.1,
      unit: 'V',
      signed: false,
      deviceClass: 'voltage',
      stateClass: 'measurement',
    }),
  ];

  it('updates and resolves readings', () => {
    const state = new InverterState('inv-1');
    const regs = new Map([
      [674, 3000],
      [672, 3456],
    ]);
    const readings = state.updateRegisters(regs, sensors);
    expect(readings).toHaveLength(2);
    expect(readings.find((r) => r.sensorId === 'pv1_power')?.value).toBe(3000);
    expect(readings.find((r) => r.sensorId === 'pv1_voltage')?.value).toBe(345.6);
  });

  it('tracks changes', () => {
    const state = new InverterState('inv-1');
    state.updateRegisters(new Map([[674, 3000]]), sensors);

    // Same value → not changed
    state.clearChanges();
    state.updateRegisters(new Map([[674, 3000]]), sensors);
    expect(state.getChangedReadings(sensors)).toHaveLength(0);

    // Different value → changed
    state.updateRegisters(new Map([[674, 4000]]), sensors);
    const changed = state.getChangedReadings(sensors);
    expect(changed).toHaveLength(1);
    expect(changed[0].value).toBe(4000);
  });

  it('returns value by sensor id', () => {
    const state = new InverterState('inv-1');
    state.updateRegisters(new Map([[674, 5000]]), sensors);
    expect(state.getValue('pv1_power')).toBe(5000);
    expect(state.getValue('nonexistent')).toBeUndefined();
  });

  it('marks readings as stale when registers are old', () => {
    const state = new InverterState('inv-1', 5000); // 5s threshold

    // Initial update at t=1000
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    state.updateRegisters(new Map([[674, 3000]]), sensors);

    // Get readings at t=1000 — not stale
    const fresh = state.getAllReadings(sensors);
    expect(fresh.find((r) => r.sensorId === 'pv1_power')?.stale).toBeFalsy();

    // Get readings at t=7000 (6s later, past 5s threshold) — stale
    vi.spyOn(Date, 'now').mockReturnValue(7000);
    const stale = state.getAllReadings(sensors);
    expect(stale.find((r) => r.sensorId === 'pv1_power')?.stale).toBe(true);

    vi.restoreAllMocks();
  });

  it('readings are not stale right after update', () => {
    const state = new InverterState('inv-1', 5000);

    vi.spyOn(Date, 'now').mockReturnValue(10000);
    state.updateRegisters(new Map([[674, 3000], [672, 2000]]), sensors);

    const readings = state.getAllReadings(sensors);
    for (const r of readings) {
      expect(r.stale).toBeFalsy();
    }

    vi.restoreAllMocks();
  });

  it('hasCachedValues is false initially and true after update', () => {
    const state = new InverterState('inv-1');
    expect(state.hasCachedValues).toBe(false);

    state.updateRegisters(new Map([[674, 100]]), sensors);
    expect(state.hasCachedValues).toBe(true);
  });
});
