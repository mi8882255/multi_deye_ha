import type { Sensor } from '../sensors/sensor.js';
import type { SensorReading, SensorValue } from '../sensors/types.js';

const DEFAULT_STALE_THRESHOLD_MS = 120_000; // 120 seconds

/**
 * Holds the current state of a single inverter.
 * Stores raw register values and resolved sensor readings.
 * Tracks which values have changed since last report.
 * Tracks per-register timestamps for stale detection.
 */
export class InverterState {
  readonly inverterId: string;
  private rawRegisters = new Map<number, number>();
  private registerTimestamps = new Map<number, number>();
  private currentValues = new Map<string, SensorValue>();
  private changedSensors = new Set<string>();
  private lastUpdateTime = 0;
  private readonly staleThresholdMs: number;

  constructor(inverterId: string, staleThresholdMs?: number) {
    this.inverterId = inverterId;
    this.staleThresholdMs = staleThresholdMs ?? DEFAULT_STALE_THRESHOLD_MS;
  }

  /**
   * Update raw registers from a read cycle and resolve sensor values.
   */
  updateRegisters(registers: Map<number, number>, sensors: Sensor[]): SensorReading[] {
    const now = Date.now();

    // Merge new registers into existing with per-register timestamps
    for (const [addr, val] of registers) {
      this.rawRegisters.set(addr, val);
      this.registerTimestamps.set(addr, now);
    }

    const readings: SensorReading[] = [];
    this.lastUpdateTime = now;

    for (const sensor of sensors) {
      const value = sensor.resolve(this.rawRegisters);
      if (value === null) continue;

      const prev = this.currentValues.get(sensor.id);
      if (prev !== value) {
        this.changedSensors.add(sensor.id);
      }
      this.currentValues.set(sensor.id, value);

      readings.push({
        sensorId: sensor.id,
        name: sensor.name,
        value,
        unit: sensor.unit,
        timestamp: now,
      });
    }

    return readings;
  }

  /**
   * Check if a sensor's registers are stale (oldest register timestamp > threshold).
   */
  private isSensorStale(sensor: Sensor, now: number): boolean {
    let oldest = Infinity;
    for (const addr of sensor.addresses) {
      const ts = this.registerTimestamps.get(addr);
      if (ts === undefined) return false; // no data yet, not stale — just missing
      if (ts < oldest) oldest = ts;
    }
    return oldest !== Infinity && (now - oldest) > this.staleThresholdMs;
  }

  /**
   * Get all current readings, with stale flag where applicable.
   */
  getAllReadings(sensors: Sensor[]): SensorReading[] {
    const readings: SensorReading[] = [];
    const now = Date.now();
    for (const sensor of sensors) {
      const value = this.currentValues.get(sensor.id);
      if (value === undefined || value === null) continue;
      const stale = this.isSensorStale(sensor, now);
      readings.push({
        sensorId: sensor.id,
        name: sensor.name,
        value,
        unit: sensor.unit,
        timestamp: this.lastUpdateTime,
        ...(stale ? { stale: true } : {}),
      });
    }
    return readings;
  }

  /**
   * Get readings only for sensors that have changed since last report.
   */
  getChangedReadings(sensors: Sensor[]): SensorReading[] {
    return this.getAllReadings(sensors).filter((r) =>
      this.changedSensors.has(r.sensorId),
    );
  }

  /**
   * Clear change tracking (called after a report is sent).
   */
  clearChanges(): void {
    this.changedSensors.clear();
  }

  /**
   * Get the current value for a specific sensor.
   */
  getValue(sensorId: string): SensorValue | undefined {
    return this.currentValues.get(sensorId);
  }

  /**
   * Get a raw register value.
   */
  getRawRegister(address: number): number | undefined {
    return this.rawRegisters.get(address);
  }

  /**
   * Whether any cached values exist (for fallback on poll failure).
   */
  get hasCachedValues(): boolean {
    return this.currentValues.size > 0;
  }

  get lastUpdate(): number {
    return this.lastUpdateTime;
  }
}
