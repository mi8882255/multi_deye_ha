/* eslint-disable @typescript-eslint/no-explicit-any */
import ModbusRTU from 'modbus-serial';
import { SolarmanV5Client } from './solarman-v5.js';
import { createLogger } from '../utils/logger.js';
import type { ModbusClientOptions } from './types.js';
import { InverterNotRespondingError, ModbusConnectionError, ModbusReadError } from '../../shared/errors.js';

const log = createLogger('modbus-client');

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 2;
const RECONNECT_DELAY = 3000;

function createRawClient(): any {
  return new (ModbusRTU as any)();
}

/**
 * Unified Modbus client that supports two transports:
 * - Raw Modbus TCP (port 502) — via modbus-serial
 * - Solarman V5 (port 8899) — via custom implementation
 *
 * Transport is auto-detected from `protocol` option, or defaults to
 * 'solarman' when serialNumber is provided.
 */
export class ModbusClient {
  private rawClient: any;
  private solarmanClient: SolarmanV5Client | null = null;
  private protocol: 'tcp' | 'solarman';
  private connected = false;
  private connecting = false;
  private readonly host: string;
  private readonly port: number;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly serialNumber: number;
  private currentUnitId = 1;

  constructor(options: ModbusClientOptions) {
    this.host = options.host;
    this.port = options.port;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.retries = options.retries ?? DEFAULT_RETRIES;
    this.serialNumber = options.serialNumber ?? 0;

    // Auto-detect protocol
    if (options.protocol) {
      this.protocol = options.protocol;
    } else if (this.serialNumber > 0) {
      this.protocol = 'solarman';
    } else {
      this.protocol = 'tcp';
    }

    if (this.protocol === 'solarman') {
      this.solarmanClient = new SolarmanV5Client(
        this.host,
        this.port,
        this.serialNumber,
        this.timeout,
      );
    } else {
      this.rawClient = createRawClient();
      this.rawClient.setTimeout(this.timeout);
    }
  }

  get isConnected(): boolean {
    if (this.protocol === 'solarman') {
      return this.connected && (this.solarmanClient?.isConnected ?? false);
    }
    return this.connected && this.rawClient?.isOpen;
  }

  get key(): string {
    return `${this.host}:${this.port}`;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    if (this.connecting) return;

    this.connecting = true;
    try {
      log.info(
        { host: this.host, port: this.port, protocol: this.protocol },
        'Connecting',
      );

      if (this.protocol === 'solarman') {
        await this.solarmanClient!.connect();
      } else {
        await this.rawClient.connectTCP(this.host, { port: this.port });
      }

      this.connected = true;
      log.info(
        { host: this.host, port: this.port, protocol: this.protocol },
        'Connected',
      );
    } catch (err) {
      this.connected = false;
      throw new ModbusConnectionError(this.host, this.port, err as Error);
    } finally {
      this.connecting = false;
    }
  }

  async reconnect(): Promise<void> {
    log.warn({ host: this.host, port: this.port }, 'Reconnecting...');

    if (this.protocol === 'solarman') {
      this.solarmanClient?.close();
      this.solarmanClient = new SolarmanV5Client(
        this.host,
        this.port,
        this.serialNumber,
        this.timeout,
      );
    } else {
      try {
        this.rawClient.close(() => {});
      } catch {
        // ignore close errors
      }
      this.rawClient = createRawClient();
      this.rawClient.setTimeout(this.timeout);
    }

    this.connected = false;
    await new Promise((r) => setTimeout(r, RECONNECT_DELAY));
    await this.connect();
  }

  setUnitId(unitId: number): void {
    this.currentUnitId = unitId;
    if (this.protocol === 'tcp') {
      this.rawClient.setID(unitId);
    }
  }

  /**
   * Read holding registers with retries.
   */
  async readHoldingRegisters(
    address: number,
    count: number,
  ): Promise<number[]> {
    let lastErr: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        if (!this.isConnected) {
          await this.reconnect();
        }

        if (this.protocol === 'solarman') {
          return await this.solarmanClient!.readHoldingRegisters(
            this.currentUnitId,
            address,
            count,
          );
        } else {
          const result = await this.rawClient.readHoldingRegisters(address, count);
          return result.data;
        }
      } catch (err) {
        lastErr = err as Error;
        log.warn(
          { address, count, attempt, err: lastErr.message },
          'Read failed',
        );

        // Don't reconnect for data-level errors (logger is fine, inverter isn't)
        if (lastErr instanceof InverterNotRespondingError) {
          throw lastErr;
        }

        if (attempt < this.retries) {
          await this.reconnect();
        }
      }
    }

    throw new ModbusReadError(address, count, lastErr);
  }

  async close(): Promise<void> {
    try {
      if (this.protocol === 'solarman') {
        this.solarmanClient?.close();
      } else {
        this.rawClient?.close(() => {});
      }
      this.connected = false;
    } catch {
      // ignore
    }
  }
}
