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
  /**
   * Marks a `total`-class energy counter that resets to ~0 once per local day
   * (e.g. day_pv_energy). Enables reset detection: a drop in value is treated
   * as a legitimate meter reset and published with a fresh `last_reset`
   * timestamp, instead of letting HA's total_increasing heuristic mistake it
   * for an anomaly and produce a false negative spike in the Energy dashboard.
   */
  dailyReset?: boolean;
}

export interface SensorReading {
  sensorId: string;
  name: string;
  value: number | string;
  unit: string;
  timestamp: number;
  /** True when this reading comes from cache and may be outdated */
  stale?: boolean;
  /** For dailyReset sensors: epoch ms of the last detected counter reset */
  lastReset?: number;
}

export type SensorValue = number | string | null;
