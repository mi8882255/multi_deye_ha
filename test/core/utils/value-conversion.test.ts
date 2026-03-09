import { describe, it, expect } from 'vitest';
import {
  applyFactor,
  toSigned16,
  toSigned32,
  combine32,
  applyBitmask,
  extractBit,
} from '../../../src/core/utils/value-conversion.js';

describe('applyFactor', () => {
  it('returns raw when factor is 1', () => {
    expect(applyFactor(2345, 1)).toBe(2345);
  });

  it('applies factor 0.1', () => {
    expect(applyFactor(2345, 0.1)).toBe(234.5);
  });

  it('applies factor 0.01', () => {
    expect(applyFactor(5000, 0.01)).toBe(50);
  });

  it('applies factor 10', () => {
    expect(applyFactor(5, 10)).toBe(50);
  });
});

describe('toSigned16', () => {
  it('returns positive for small values', () => {
    expect(toSigned16(100)).toBe(100);
  });

  it('returns max positive (0x7FFF)', () => {
    expect(toSigned16(0x7fff)).toBe(32767);
  });

  it('returns -1 for 0xFFFF', () => {
    expect(toSigned16(0xffff)).toBe(-1);
  });

  it('returns negative for values above 0x7FFF', () => {
    expect(toSigned16(0x8000)).toBe(-32768);
  });
});

describe('toSigned32', () => {
  it('returns positive for small values', () => {
    expect(toSigned32(100)).toBe(100);
  });

  it('returns -1 for 0xFFFFFFFF', () => {
    expect(toSigned32(0xffffffff)).toBe(-1);
  });
});

describe('combine32', () => {
  it('combines high and low words', () => {
    expect(combine32(0x0001, 0x0000)).toBe(0x00010000);
  });

  it('combines specific values', () => {
    expect(combine32(0x1234, 0x5678)).toBe(0x12345678);
  });

  it('returns unsigned value when high word has bit 15 set', () => {
    // This was broken with << (JS signed 32-bit overflow)
    expect(combine32(0x8000, 0x0000)).toBe(0x80000000);
    expect(combine32(0xFFFF, 0xFFFF)).toBe(0xFFFFFFFF);
  });
});

describe('applyBitmask', () => {
  it('masks off bits', () => {
    expect(applyBitmask(0xff, 0x0f)).toBe(0x0f);
  });
});

describe('extractBit', () => {
  it('extracts bit 0', () => {
    expect(extractBit(0b1010, 0)).toBe(0);
    expect(extractBit(0b1011, 0)).toBe(1);
  });

  it('extracts bit 3', () => {
    expect(extractBit(0b1000, 3)).toBe(1);
    expect(extractBit(0b0111, 3)).toBe(0);
  });
});
