import { EventEmitter } from 'node:events';
import type { ModbusPool } from '../modbus/modbus-pool.js';
import { readRegisters } from '../modbus/register-reader.js';
import type { Sensor } from '../sensors/sensor.js';
import { SensorRegistry } from '../sensors/sensor-registry.js';
import { InverterState } from './inverter-state.js';
import type { InverterIdentity } from './types.js';
import { createLogger } from '../utils/logger.js';
import type { SensorReading } from '../sensors/types.js';

const log = createLogger('inverter-poller');

export interface PollerEvents {
  readings: [inverterId: string, readings: SensorReading[]];
  error: [inverterId: string, error: Error];
}

/**
 * Polls a single inverter's registers and emits sensor readings.
 */
export class InverterPoller extends EventEmitter {
  readonly identity: InverterIdentity;
  readonly state: InverterState;
  readonly registry: SensorRegistry;
  private pool: ModbusPool;

  constructor(
    identity: InverterIdentity,
    sensors: Sensor[],
    pool: ModbusPool,
  ) {
    super();
    this.identity = identity;
    this.state = new InverterState(identity.id);
    this.registry = new SensorRegistry();
    this.registry.registerAll(sensors);
    this.pool = pool;
  }

  /**
   * Perform a single poll cycle: read all registers and emit readings.
   */
  async poll(): Promise<SensorReading[]> {
    const addresses = this.registry.getAllAddresses();
    if (addresses.length === 0) {
      log.warn({ inverterId: this.identity.id }, 'No sensor addresses to read');
      return [];
    }

    try {
      const result = await this.pool.withConnection(
        {
          host: this.identity.host,
          port: this.identity.port,
          serialNumber: this.identity.serialNumber,
        },
        this.identity.unitId,
        (client) => readRegisters(client, addresses),
      );

      if (result.errors.length > 0) {
        log.warn(
          { inverterId: this.identity.id, errors: result.errors.length },
          'Some registers failed to read',
        );
      }

      const sensors = this.registry.getAll();
      const readings = this.state.updateRegisters(result.registers, sensors);

      this.emit('readings', this.identity.id, readings);
      return readings;
    } catch (err) {
      const error = err as Error;
      log.error(
        { inverterId: this.identity.id, err: error.message },
        'Poll failed',
      );
      this.emit('error', this.identity.id, error);
      throw error;
    }
  }
}
