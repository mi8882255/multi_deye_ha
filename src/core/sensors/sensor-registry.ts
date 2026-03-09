import type { Sensor, PollTier } from './sensor.js';

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

  /** Get sensors matching the given poll tier */
  getSensorsByTier(tier: PollTier): Sensor[] {
    return this.getAll().filter((s) => s.pollTier === tier);
  }

  /** Get unique register addresses for sensors of the given poll tier */
  getAddressesByTier(tier: PollTier): number[] {
    const addrs = new Set<number>();
    for (const sensor of this.byId.values()) {
      if (sensor.pollTier === tier) {
        for (const addr of sensor.addresses) {
          addrs.add(addr);
        }
      }
    }
    return [...addrs].sort((a, b) => a - b);
  }

  get size(): number {
    return this.byId.size;
  }
}
