import { describe, it, expect } from 'vitest';
import { Sensor, TempSensor, EnumSensor, BinarySensor } from '../../../src/core/sensors/sensor.js';
import type { SensorDefinition } from '../../../src/core/sensors/types.js';

describe('Sensor', () => {
  const def: SensorDefinition = {
    id: 'pv1_voltage',
    name: 'PV1 Voltage',
    address: 672,
    size: 1,
    factor: 0.1,
    unit: 'V',
    signed: false,
  };

  it('resolves a basic value', () => {
    const sensor = new Sensor(def);
    const regs = new Map([[672, 2345]]);
    expect(sensor.resolve(regs)).toBe(234.5);
  });

  it('returns null if register is missing', () => {
    const sensor = new Sensor(def);
    const regs = new Map<number, number>();
    expect(sensor.resolve(regs)).toBeNull();
  });

  it('handles signed 16-bit values', () => {
    const sensor = new Sensor({ ...def, signed: true });
    const regs = new Map([[672, 0xfff6]]); // -10 in signed 16
    expect(sensor.resolve(regs)).toBe(-1);  // -10 * 0.1
  });

  it('resolves 32-bit values', () => {
    const sensor = new Sensor({
      ...def,
      address: 100,
      size: 2,
      factor: 0.1,
    });
    const regs = new Map([
      [100, 0x0000],  // low word at address
      [101, 0x0001],  // high word at address+1
    ]);
    // little-endian word order: combine32(high=1, low=0) = 65536, * 0.1 = 6553.6
    expect(sensor.resolve(regs)).toBe(6553.6);
  });

  it('lists addresses', () => {
    const sensor = new Sensor({ ...def, size: 2 });
    expect(sensor.addresses).toEqual([672, 673]);
  });

  it('applies offset', () => {
    const sensor = new Sensor({ ...def, offset: 1000, factor: 0.1 });
    const regs = new Map([[672, 1234]]);
    // (1234 - 1000) * 0.1 = 23.4
    expect(sensor.resolve(regs)).toBe(23.4);
  });
});

describe('TempSensor', () => {
  it('converts temperature (raw - 1000) * 0.1', () => {
    const sensor = new TempSensor({
      id: 'dc_temp',
      name: 'DC Temperature',
      address: 541,
      size: 1,
    });
    const regs = new Map([[541, 1234]]);
    expect(sensor.resolve(regs)).toBe(23.4);
  });
});

describe('EnumSensor', () => {
  it('maps value to label', () => {
    const sensor = new EnumSensor({
      id: 'status',
      name: 'Running Status',
      address: 500,
      size: 1,
      factor: 1,
      unit: '',
      signed: false,
      enumMap: { 0: 'Standby', 2: 'Normal' },
    });
    const regs = new Map([[500, 2]]);
    expect(sensor.resolve(regs)).toBe('Normal');
  });

  it('returns unknown for unmapped value', () => {
    const sensor = new EnumSensor({
      id: 'status',
      name: 'Status',
      address: 500,
      size: 1,
      factor: 1,
      unit: '',
      signed: false,
      enumMap: { 0: 'Off' },
    });
    const regs = new Map([[500, 99]]);
    expect(sensor.resolve(regs)).toBe('unknown(99)');
  });
});

describe('BinarySensor', () => {
  it('extracts bit value', () => {
    const sensor = new BinarySensor({
      id: 'flag',
      name: 'Flag',
      address: 100,
      size: 1,
      factor: 1,
      unit: '',
      signed: false,
      bit: 2,
    });
    const regs = new Map([[100, 0b00000100]]);
    expect(sensor.resolve(regs)).toBe(1);
  });
});
