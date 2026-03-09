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
  /** Number of read retries per batch (default 4) */
  retries?: number;
  /** Minimum retry delay in ms (default 200) */
  retryMinDelay?: number;
  /** Maximum retry delay in ms (default 1000) */
  retryMaxDelay?: number;
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
  /** Max gap between registers to merge into one batch (default 10) */
  gapTolerance: number;
  /** Seconds before a cached reading is considered stale (default 120) */
  staleThresholdSeconds: number;
  /** Read slow-tier sensors every N cycles (default 6) */
  slowPollMultiplier: number;
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
  gapTolerance: 10,
  staleThresholdSeconds: 120,
  slowPollMultiplier: 6,
};

export const DEFAULT_MQTT: MqttConfig = {
  host: 'localhost',
  port: 1883,
  topicPrefix: 'deye',
  discoveryPrefix: 'homeassistant',
};
