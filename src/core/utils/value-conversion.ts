/**
 * Apply a numeric factor (scale) to a raw value.
 * factor=0.1 means the raw value 2345 → 234.5
 */
export function applyFactor(raw: number, factor: number): number {
  if (factor === 1) return raw;
  const result = raw * factor;
  // Avoid floating-point noise: round to significant digits of factor
  const decimals = countDecimals(factor);
  return decimals > 0 ? parseFloat(result.toFixed(decimals + 2)) : result;
}

function countDecimals(n: number): number {
  const s = n.toString();
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

/**
 * Interpret a 16-bit value as signed (two's complement).
 */
export function toSigned16(val: number): number {
  return val > 0x7fff ? val - 0x10000 : val;
}

/**
 * Interpret a 32-bit value as signed (two's complement).
 */
export function toSigned32(val: number): number {
  return val > 0x7fffffff ? val - 0x100000000 : val;
}

/**
 * Combine two 16-bit registers into a single 32-bit value (big-endian: high word first).
 */
export function combine32(high: number, low: number): number {
  // Use multiplication instead of << to avoid JS signed 32-bit overflow
  return (high & 0xffff) * 0x10000 + (low & 0xffff);
}

/**
 * Extract bits from a value.
 * @param value - the raw register value
 * @param bitmask - bitmask to apply
 */
export function applyBitmask(value: number, bitmask: number): number {
  return value & bitmask;
}

/**
 * Extract a specific bit from a value. Returns 0 or 1.
 */
export function extractBit(value: number, bit: number): number {
  return (value >> bit) & 1;
}
