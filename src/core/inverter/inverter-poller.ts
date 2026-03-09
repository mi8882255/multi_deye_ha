import { EventEmitter } from 'node:events';
import type { ModbusPool } from '../modbus/modbus-pool.js';
import type { ModbusClientOptions } from '../modbus/types.js';
import { readRegisters } from '../modbus/register-reader.js';
import type { Sensor } from '../sensors/sensor.js';
import { SensorRegistry } from '../sensors/sensor-registry.js';
import { InverterState } from './inverter-state.js';
import type { InverterIdentity } from './types.js';
import { createLogger } from '../utils/logger.js';
import type { SensorReading } from '../sensors/types.js';

const log = createLogger('inverter-poller');

const DEFAULT_GAP_TOLERANCE = 10;
const DEFAULT_SLOW_POLL_MULTIPLIER = 6;

export type PollTier = 'fast' | 'slow';

export interface PollerOptions {
  gapTolerance?: number;
  staleThresholdSeconds?: number;
  slowPollMultiplier?: number;
  modbusOptions?: Partial<ModbusClientOptions>;
}

export interface PollerEvents {
  readings: [inverterId: string, readings: SensorReading[]];
  error: [inverterId: string, error: Error];
}

/**
 * Polls a single inverter's registers and emits sensor readings.
 * Supports two-level polling (fast/slow) and stale cache fallback.
 */
export class InverterPoller extends EventEmitter {
  readonly identity: InverterIdentity;
  readonly state: InverterState;
  readonly registry: SensorRegistry;
  private pool: ModbusPool;
  private gapTolerance: number;
  private slowPollMultiplier: number;
  private cycleCount = 0;
  private modbusOptions: Partial<ModbusClientOptions>;

  constructor(
    identity: InverterIdentity,
    sensors: Sensor[],
    pool: ModbusPool,
    options?: PollerOptions,
  ) {
    super();
    this.identity = identity;
    this.state = new InverterState(
      identity.id,
      (options?.staleThresholdSeconds ?? 120) * 1000,
    );
    this.registry = new SensorRegistry();
    this.registry.registerAll(sensors);
    this.pool = pool;
    this.gapTolerance = options?.gapTolerance ?? DEFAULT_GAP_TOLERANCE;
    this.slowPollMultiplier = options?.slowPollMultiplier ?? DEFAULT_SLOW_POLL_MULTIPLIER;
    this.modbusOptions = options?.modbusOptions ?? {};
  }

  /**
   * Perform a single poll cycle: read registers and emit readings.
   * On failure, returns cached stale readings if available.
   */
  async poll(): Promise<SensorReading[]> {
    const isSlowCycle = this.cycleCount % this.slowPollMultiplier === 0;
    this.cycleCount++;

    const addresses = isSlowCycle
      ? this.registry.getAllAddresses()
      : this.registry.getAddressesByTier('fast');

    // Fall back to all addresses if no fast-tier addresses
    const effectiveAddresses = addresses.length > 0
      ? addresses
      : this.registry.getAllAddresses();

    if (effectiveAddresses.length === 0) {
      log.warn({ inverterId: this.identity.id }, 'No sensor addresses to read');
      return [];
    }

    try {
      const result = await this.pool.withConnection(
        {
          host: this.identity.host,
          port: this.identity.port,
          serialNumber: this.identity.serialNumber,
          ...this.modbusOptions,
        },
        this.identity.unitId,
        (client) => readRegisters(client, effectiveAddresses, this.gapTolerance),
      );

      if (result.errors.length > 0) {
        log.warn(
          { inverterId: this.identity.id, errors: result.errors.length },
          'Some registers failed to read',
        );
      }

      const sensors = isSlowCycle
        ? this.registry.getAll()
        : this.registry.getSensorsByTier('fast');
      const effectiveSensors = sensors.length > 0 ? sensors : this.registry.getAll();
      const readings = this.state.updateRegisters(result.registers, effectiveSensors);

      this.emit('readings', this.identity.id, readings);
      return readings;
    } catch (err) {
      const error = err as Error;
      log.error(
        { inverterId: this.identity.id, err: error.message },
        'Poll failed',
      );
      this.emit('error', this.identity.id, error);

      // Return cached stale readings instead of throwing
      if (this.state.hasCachedValues) {
        const sensors = this.registry.getAll();
        const staleReadings = this.state.getAllReadings(sensors);
        log.info(
          { inverterId: this.identity.id, readings: staleReadings.length },
          'Returning cached readings',
        );
        return staleReadings;
      }

      throw error;
    }
  }
}
