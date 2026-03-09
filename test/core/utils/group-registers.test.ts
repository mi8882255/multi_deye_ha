import { describe, it, expect } from 'vitest';
import { groupRegisters } from '../../../src/core/utils/group-registers.js';

describe('groupRegisters', () => {
  it('returns empty for no addresses', () => {
    expect(groupRegisters([])).toEqual([]);
  });

  it('groups a single address', () => {
    expect(groupRegisters([100])).toEqual([{ start: 100, count: 1 }]);
  });

  it('groups contiguous addresses', () => {
    expect(groupRegisters([100, 101, 102])).toEqual([
      { start: 100, count: 3 },
    ]);
  });

  it('merges addresses within gap tolerance', () => {
    expect(groupRegisters([100, 104], 5)).toEqual([
      { start: 100, count: 5 },
    ]);
  });

  it('splits addresses beyond gap tolerance', () => {
    expect(groupRegisters([100, 110], 3)).toEqual([
      { start: 100, count: 1 },
      { start: 110, count: 1 },
    ]);
  });

  it('handles unsorted input', () => {
    expect(groupRegisters([105, 100, 102, 101])).toEqual([
      { start: 100, count: 6 },
    ]);
  });

  it('splits at max batch size', () => {
    const addrs = Array.from({ length: 150 }, (_, i) => i);
    const groups = groupRegisters(addrs, 3, 100);
    expect(groups.length).toBe(2);
    expect(groups[0]).toEqual({ start: 0, count: 100 });
    expect(groups[1]).toEqual({ start: 100, count: 50 });
  });

  it('creates multiple groups for sparse addresses', () => {
    expect(groupRegisters([100, 101, 200, 201, 300])).toEqual([
      { start: 100, count: 2 },
      { start: 200, count: 2 },
      { start: 300, count: 1 },
    ]);
  });
});
