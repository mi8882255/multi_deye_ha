// Core
export { Sensor, TempSensor, EnumSensor, BinarySensor, MathSensor } from './core/sensors/sensor.js';
export { SensorRegistry } from './core/sensors/sensor-registry.js';
export type { SensorDefinition, SensorReading, SensorValue } from './core/sensors/types.js';

export { ModbusClient } from './core/modbus/modbus-client.js';
export { ModbusPool } from './core/modbus/modbus-pool.js';
export { readRegisters } from './core/modbus/register-reader.js';
export type { ModbusClientOptions, RegisterResult } from './core/modbus/types.js';

export { InverterState } from './core/inverter/inverter-state.js';
export { InverterPoller } from './core/inverter/inverter-poller.js';
export type { InverterModel, InverterIdentity } from './core/inverter/types.js';

export { Scheduler } from './core/scheduler/scheduler.js';
export { buildSensors, getDefinitions, getSupportedModels } from './core/definitions/index.js';

export { groupRegisters } from './core/utils/group-registers.js';
export { toSlug } from './core/utils/slug.js';
export * from './core/utils/value-conversion.js';

// Shared
export type { AppConfig, InverterConfig, MqttConfig, SchedulerConfig } from './shared/config.js';
export { ModbusConnectionError, ModbusReadError, ConfigValidationError } from './shared/errors.js';
