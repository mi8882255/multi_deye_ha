import type { Sensor } from '../sensors/sensor.js';
import type { SensorReading, SensorValue } from '../sensors/types.js';

/**
 * Holds the current state of a single inverter.
 * Stores raw register values and resolved sensor readings.
 * Tracks which values have changed since last report.
 */
export class InverterState {
  readonly inverterId: string;
  private rawRegisters = new Map<number, number>();
  private currentValues = new Map<string, SensorValue>();
  private changedSensors = new Set<string>();
  private lastUpdateTime = 0;

  constructor(inverterId: string) {
    this.inverterId = inverterId;
  }

  /**
   * Update raw registers from a read cycle and resolve sensor values.
   */
  updateRegisters(registers: Map<number, number>, sensors: Sensor[]): SensorReading[] {
    // Merge new registers into existing
    for (const [addr, val] of registers) {
      this.rawRegisters.set(addr, val);
    }

    const readings: SensorReading[] = [];
    const now = Date.now();
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
   * Get all current readings.
   */
  getAllReadings(sensors: Sensor[]): SensorReading[] {
    const readings: SensorReading[] = [];
    for (const sensor of sensors) {
      const value = this.currentValues.get(sensor.id);
      if (value === undefined || value === null) continue;
      readings.push({
        sensorId: sensor.id,
        name: sensor.name,
        value,
        unit: sensor.unit,
        timestamp: this.lastUpdateTime,
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

  get lastUpdate(): number {
    return this.lastUpdateTime;
  }
}
