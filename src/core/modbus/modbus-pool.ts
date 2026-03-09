import { Mutex } from 'async-mutex';
import { ModbusClient } from './modbus-client.js';
import type { ModbusClientOptions } from './types.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('modbus-pool');

interface PoolEntry {
  client: ModbusClient;
  mutex: Mutex;
}

/**
 * Manages a pool of Modbus TCP connections.
 * One TCP connection per unique host:port pair.
 * Uses async-mutex to serialize access when multiple unit IDs share a connection.
 */
export class ModbusPool {
  private pool = new Map<string, PoolEntry>();

  /**
   * Get (or create) a connection for the given host:port.
   */
  getEntry(options: ModbusClientOptions): PoolEntry {
    const key = `${options.host}:${options.port}`;
    let entry = this.pool.get(key);
    if (!entry) {
      log.info({ key }, 'Creating new Modbus connection');
      const client = new ModbusClient(options);
      entry = { client, mutex: new Mutex() };
      this.pool.set(key, entry);
    }
    return entry;
  }

  /**
   * Execute a callback with exclusive access to a Modbus connection,
   * with the specified unitId set.
   */
  async withConnection<T>(
    options: ModbusClientOptions,
    unitId: number,
    fn: (client: ModbusClient) => Promise<T>,
  ): Promise<T> {
    const entry = this.getEntry(options);

    return entry.mutex.runExclusive(async () => {
      if (!entry.client.isConnected) {
        await entry.client.connect();
      }
      entry.client.setUnitId(unitId);
      return fn(entry.client);
    });
  }

  /**
   * Close all connections in the pool.
   */
  async closeAll(): Promise<void> {
    const entries = [...this.pool.values()];
    this.pool.clear();
    await Promise.allSettled(entries.map((e) => e.client.close()));
    log.info('All Modbus connections closed');
  }
}
