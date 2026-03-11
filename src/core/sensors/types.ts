export interface SensorDefinition {
  id: string;
  name: string;
  /** Starting register address */
  address: number;
  /** Number of registers (1 for 16-bit, 2 for 32-bit) */
  size: number;
  /** Scale factor (e.g. 0.1, 0.01) */
  factor: number;
  /** Unit of measurement (W, V, A, kWh, °C, Hz, %) */
  unit: string;
  /** Whether the value is signed */
  signed: boolean;
  /** HA device class */
  deviceClass?: string;
  /** HA state class */
  stateClass?: string;
  /** Bitmask to apply after reading */
  bitmask?: number;
  /** Bit index to extract (for binary sensors) */
  bit?: number;
  /** Enum mapping for status values */
  enumMap?: Record<number, string>;
  /** Offset to subtract (e.g. for temperatures: raw - 1000 → °C) */
  offset?: number;
  /** Computed sensor: sum raw values at these addresses (address field ignored) */
  sumOf?: number[];
}

export interface SensorReading {
  sensorId: string;
  name: string;
  value: number | string;
  unit: string;
  timestamp: number;
  /** True when this reading comes from cache and may be outdated */
  stale?: boolean;
}

export type SensorValue = number | string | null;
