import { describe, it, expect } from 'vitest';
import { getDefinitions, getSupportedModels, buildSensors } from '../../../src/core/definitions/index.js';
import { MathSensor } from '../../../src/core/sensors/sensor.js';

describe('definitions', () => {
  it('lists supported models', () => {
    const models = getSupportedModels();
    expect(models).toContain('deye-sun-3phase-lv');
    expect(models).toContain('deye-sun-3phase-hv');
  });

  it('loads LV definitions', () => {
    const defs = getDefinitions('deye-sun-3phase-lv');
    expect(defs.length).toBeGreaterThan(10);
  });

  it('HV includes LV sensors plus extras', () => {
    const lv = getDefinitions('deye-sun-3phase-lv');
    const hv = getDefinitions('deye-sun-3phase-hv');
    expect(hv.length).toBeGreaterThan(lv.length);
  });

  it('throws for unknown model', () => {
    expect(() => getDefinitions('unknown' as never)).toThrow('Unknown inverter model');
  });

  it('builds Sensor instances', () => {
    const sensors = buildSensors('deye-sun-3phase-lv');
    expect(sensors.length).toBeGreaterThan(0);
    expect(sensors[0].id).toBeDefined();
    expect(sensors[0].address).toBeDefined();
  });

  it('filters sensors by id', () => {
    const sensors = buildSensors('deye-sun-3phase-lv', ['pv1_voltage', 'pv1_power']);
    expect(sensors).toHaveLength(2);
    expect(sensors.map((s) => s.id).sort()).toEqual(['pv1_power', 'pv1_voltage']);
  });

  it('creates MathSensor for definitions with sumOf', () => {
    const sensors = buildSensors('deye-sg05lp3');
    const pvTotal = sensors.find((s) => s.id === 'pv_total_power');
    const vtSolar = sensors.find((s) => s.id === 'vt_solar_power');

    expect(pvTotal).toBeInstanceOf(MathSensor);
    expect(vtSolar).toBeInstanceOf(MathSensor);

    // Should read from PV1+PV2 source addresses
    expect(pvTotal!.addresses).toEqual([672, 673]);
    expect(vtSolar!.addresses).toEqual([672, 673]);
  });

  it('sumOf MathSensor computes sum of register values', () => {
    const sensors = buildSensors('deye-sg05lp3', ['pv_total_power']);
    const pvTotal = sensors[0] as MathSensor;

    const registers = new Map<number, number>([
      [672, 1500], // PV1
      [673, 2000], // PV2
    ]);
    expect(pvTotal.resolve(registers)).toBe(3500);
  });

  it('sumOf MathSensor returns null when register missing', () => {
    const sensors = buildSensors('deye-sg05lp3', ['pv_total_power']);
    const pvTotal = sensors[0] as MathSensor;

    const registers = new Map<number, number>([[672, 1500]]);
    expect(pvTotal.resolve(registers)).toBeNull();
  });

  it('hybrid-1p pv_total_power uses sumOf not address 184', () => {
    const defs = getDefinitions('deye-hybrid-1p');
    const pvTotal = defs.find((d) => d.id === 'pv_total_power')!;
    expect(pvTotal.sumOf).toEqual([186, 187]);

    const batterySoc = defs.find((d) => d.id === 'battery_soc')!;
    expect(batterySoc.address).toBe(184);
    // No conflict: pv_total_power no longer reads address 184
  });

  it('sun-3phase-hv overrides solar totals for 4 MPPTs', () => {
    const sensors = buildSensors('deye-sun-3phase-hv');
    const pvTotal = sensors.find((s) => s.id === 'pv_total_power');
    const vtSolar = sensors.find((s) => s.id === 'vt_solar_power');

    expect(pvTotal).toBeInstanceOf(MathSensor);
    expect(vtSolar).toBeInstanceOf(MathSensor);
    expect(pvTotal!.addresses).toEqual([674, 678, 682, 686]);
    expect(vtSolar!.addresses).toEqual([674, 678, 682, 686]);
  });

  it('sg02lp1 overrides solar totals for 3 MPPTs', () => {
    const sensors = buildSensors('deye-sg02lp1');
    const pvTotal = sensors.find((s) => s.id === 'pv_total_power');
    const vtSolar = sensors.find((s) => s.id === 'vt_solar_power');

    expect(pvTotal).toBeInstanceOf(MathSensor);
    expect(vtSolar).toBeInstanceOf(MathSensor);
    expect(pvTotal!.addresses).toEqual([186, 187, 188]);
    expect(vtSolar!.addresses).toEqual([186, 187, 188]);
  });
});
