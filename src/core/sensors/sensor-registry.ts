import type { Sensor } from './sensor.js';

export class SensorRegistry {
  private byId = new Map<string, Sensor>();
  private bySlug = new Map<string, Sensor>();
  private byAddress = new Map<number, Sensor[]>();

  register(sensor: Sensor): void {
    this.byId.set(sensor.id, sensor);
    this.bySlug.set(sensor.slug, sensor);
    for (const addr of sensor.addresses) {
      const list = this.byAddress.get(addr) ?? [];
      list.push(sensor);
      this.byAddress.set(addr, list);
    }
  }

  registerAll(sensors: Sensor[]): void {
    for (const s of sensors) this.register(s);
  }

  getById(id: string): Sensor | undefined {
    return this.byId.get(id);
  }

  getBySlug(slug: string): Sensor | undefined {
    return this.bySlug.get(slug);
  }

  getSensorsForAddress(address: number): Sensor[] {
    return this.byAddress.get(address) ?? [];
  }

  /** All unique register addresses needed */
  getAllAddresses(): number[] {
    return [...this.byAddress.keys()].sort((a, b) => a - b);
  }

  getAll(): Sensor[] {
    return [...this.byId.values()];
  }

  get size(): number {
    return this.byId.size;
  }
}
