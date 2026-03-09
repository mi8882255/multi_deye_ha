/* eslint-disable @typescript-eslint/no-explicit-any */
import ModbusRTU from 'modbus-serial';
import { SolarmanV5Client } from './solarman-v5.js';
import { createLogger } from '../utils/logger.js';
import type { ModbusClientOptions } from './types.js';
import { InverterNotRespondingError, ModbusConnectionError, ModbusReadError } from '../../shared/errors.js';

const log = createLogger('modbus-client');

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 4;
const DEFAULT_RETRY_MIN_DELAY = 200;
const DEFAULT_RETRY_MAX_DELAY = 1000;

function createRawClient(): any {
  return new (ModbusRTU as any)();
}

/** Random delay between min and max ms */
function jitterDelay(min: number, max: number): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((r) => setTimeout(r, ms));
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
  private readonly retryMinDelay: number;
  private readonly retryMaxDelay: number;
  private readonly serialNumber: number;
  private currentUnitId = 1;

  constructor(options: ModbusClientOptions) {
    this.host = options.host;
    this.port = options.port;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.retries = options.retries ?? DEFAULT_RETRIES;
    this.retryMinDelay = options.retryMinDelay ?? DEFAULT_RETRY_MIN_DELAY;
    this.retryMaxDelay = options.retryMaxDelay ?? DEFAULT_RETRY_MAX_DELAY;
    this.serialNumber = options.serialNumber ?? 0;

    // Auto-detect protocol
    if (options.protocol) {
      this.protocol = options.protocol;
    } else if (this.serialNumber > 0) {
      this.protocol = 'solarman';
    } else {
      this.protocol = 'tcp';
    }

    // Transport is created fresh on each connect() call
    this.rawClient = null;
    this.solarmanClient = null;
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

  /**
   * Create a fresh transport and connect.
   * Always creates a new underlying client to avoid stale socket state.
   */
  async connect(): Promise<void> {
    if (this.connecting) return;

    this.connecting = true;
    try {
      // Close any existing transport before creating a new one
      this.destroyTransport();

      log.info(
        { host: this.host, port: this.port, protocol: this.protocol },
        'Connecting',
      );

      if (this.protocol === 'solarman') {
        this.solarmanClient = new SolarmanV5Client(
          this.host,
          this.port,
          this.serialNumber,
          this.timeout,
        );
        await this.solarmanClient.connect();
      } else {
        this.rawClient = createRawClient();
        this.rawClient.setTimeout(this.timeout);
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

  setUnitId(unitId: number): void {
    this.currentUnitId = unitId;
    if (this.protocol === 'tcp' && this.rawClient) {
      this.rawClient.setID(unitId);
    }
  }

  /**
   * Read holding registers with retries and jitter delay.
   */
  async readHoldingRegisters(
    address: number,
    count: number,
  ): Promise<number[]> {
    let lastErr: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        if (!this.isConnected) {
          await this.connect();
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

        // Don't retry for data-level errors (logger is fine, inverter isn't)
        if (lastErr instanceof InverterNotRespondingError) {
          throw lastErr;
        }

        if (attempt < this.retries) {
          this.close();
          await jitterDelay(this.retryMinDelay, this.retryMaxDelay);
        }
      }
    }

    throw new ModbusReadError(address, count, lastErr);
  }

  close(): void {
    this.destroyTransport();
    this.connected = false;
  }

  private destroyTransport(): void {
    try {
      if (this.protocol === 'solarman') {
        this.solarmanClient?.close();
        this.solarmanClient = null;
      } else if (this.rawClient) {
        this.rawClient.close(() => {});
        this.rawClient = null;
      }
    } catch {
      // ignore close errors
    }
    this.connected = false;
  }
}
