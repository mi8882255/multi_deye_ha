export interface RegisterGroup {
  start: number;
  count: number;
}

/**
 * Group an array of register addresses into contiguous batches.
 * Adjacent registers (or within `gapTolerance`) are merged into a single read.
 *
 * @param addresses - sorted unique register addresses
 * @param gapTolerance - max gap between registers to still merge (default 3)
 * @param maxBatchSize - max registers per read (Modbus limit = 125)
 */
export function groupRegisters(
  addresses: number[],
  gapTolerance = 3,
  maxBatchSize = 100,
): RegisterGroup[] {
  if (addresses.length === 0) return [];

  const sorted = [...addresses].sort((a, b) => a - b);
  const groups: RegisterGroup[] = [];

  let start = sorted[0];
  let end = sorted[0]; // inclusive last address

  for (let i = 1; i < sorted.length; i++) {
    const addr = sorted[i];
    const gap = addr - end;
    const newCount = addr - start + 1;

    if (gap <= gapTolerance && newCount <= maxBatchSize) {
      end = addr;
    } else {
      groups.push({ start, count: end - start + 1 });
      start = addr;
      end = addr;
    }
  }

  groups.push({ start, count: end - start + 1 });
  return groups;
}
