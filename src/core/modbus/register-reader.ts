import { groupRegisters } from '../utils/group-registers.js';
import { createLogger } from '../utils/logger.js';
import type { ModbusClient } from './modbus-client.js';
import type { RegisterResult } from './types.js';

const log = createLogger('register-reader');

/**
 * Reads a set of register addresses in optimized batches.
 */
export async function readRegisters(
  client: ModbusClient,
  addresses: number[],
  gapTolerance = 3,
): Promise<RegisterResult> {
  const groups = groupRegisters(addresses, gapTolerance);
  const registers = new Map<number, number>();
  const errors: number[] = [];

  log.debug({ groups: groups.length, addresses: addresses.length }, 'Reading registers');

  for (const group of groups) {
    try {
      const data = await client.readHoldingRegisters(group.start, group.count);
      for (let i = 0; i < data.length; i++) {
        registers.set(group.start + i, data[i]);
      }
    } catch (err) {
      log.warn(
        { start: group.start, count: group.count, err: (err as Error).message },
        'Batch read failed',
      );
      // Mark all addresses in this group as errors
      for (let i = 0; i < group.count; i++) {
        const addr = group.start + i;
        if (addresses.includes(addr)) {
          errors.push(addr);
        }
      }
    }
  }

  return { registers, errors };
}
