import { describe, it, expect } from 'vitest';
import { getDefinitions, getSupportedModels, buildSensors } from '../../../src/core/definitions/index.js';

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
});
