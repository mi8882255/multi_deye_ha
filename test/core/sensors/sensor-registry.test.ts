import { describe, it, expect } from 'vitest';
import { Sensor } from '../../../src/core/sensors/sensor.js';
import { SensorRegistry } from '../../../src/core/sensors/sensor-registry.js';

describe('SensorRegistry', () => {
  function makeSensor(id: string, address: number) {
    return new Sensor({
      id,
      name: id,
      address,
      size: 1,
      factor: 1,
      unit: 'W',
      signed: false,
    });
  }

  it('looks up by id', () => {
    const reg = new SensorRegistry();
    const s = makeSensor('pv1_power', 674);
    reg.register(s);
    expect(reg.getById('pv1_power')).toBe(s);
  });

  it('looks up by slug', () => {
    const reg = new SensorRegistry();
    const s = new Sensor({
      id: 'grid_v_l1',
      name: 'Grid Voltage L1',
      address: 598,
      size: 1,
      factor: 0.1,
      unit: 'V',
      signed: false,
    });
    reg.register(s);
    expect(reg.getBySlug('grid_voltage_l1')).toBe(s);
  });

  it('returns all addresses sorted', () => {
    const reg = new SensorRegistry();
    reg.registerAll([makeSensor('a', 200), makeSensor('b', 100)]);
    expect(reg.getAllAddresses()).toEqual([100, 200]);
  });

  it('reports correct size', () => {
    const reg = new SensorRegistry();
    reg.registerAll([makeSensor('a', 1), makeSensor('b', 2)]);
    expect(reg.size).toBe(2);
  });
});
