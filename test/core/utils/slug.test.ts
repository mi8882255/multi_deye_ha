import { describe, it, expect } from 'vitest';
import { toSlug } from '../../../src/core/utils/slug.js';

describe('toSlug', () => {
  it('converts spaces to underscores', () => {
    expect(toSlug('Grid Power L1')).toBe('grid_power_l1');
  });

  it('removes special characters', () => {
    expect(toSlug('Battery SOC (%)')).toBe('battery_soc');
  });

  it('handles already slugified strings', () => {
    expect(toSlug('pv1_voltage')).toBe('pv1_voltage');
  });

  it('strips leading/trailing underscores', () => {
    expect(toSlug('  hello  ')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('converts mixed case', () => {
    expect(toSlug('PV1 Voltage')).toBe('pv1_voltage');
  });
});
