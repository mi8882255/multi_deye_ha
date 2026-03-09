export interface InverterConfig {
  id: string;
  host: string;
  port: number;
  unitId: number;
  model: string;
  /** Friendly name for display */
  name?: string;
  /** Sensors to read (empty = all) */
  sensors?: string[];
  /** Logger serial number (required for Solarman V5 protocol, port 8899) */
  serialNumber?: number;
}

export interface MqttConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  topicPrefix: string;
  discoveryPrefix: string;
}

export interface SchedulerConfig {
  /** Seconds between reads */
  readInterval: number;
  /** Seconds between reports (must be >= readInterval) */
  reportInterval: number;
}

export interface AppConfig {
  inverters: InverterConfig[];
  mqtt?: MqttConfig;
  scheduler: SchedulerConfig;
  logLevel: string;
}

export const DEFAULT_SCHEDULER: SchedulerConfig = {
  readInterval: 10,
  reportInterval: 30,
};

export const DEFAULT_MQTT: MqttConfig = {
  host: 'localhost',
  port: 1883,
  topicPrefix: 'deye',
  discoveryPrefix: 'homeassistant',
};
