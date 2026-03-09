import {
  applyFactor,
  toSigned16,
  toSigned32,
  combine32,
  applyBitmask,
  extractBit,
} from '../utils/value-conversion.js';
import type { SensorDefinition, SensorValue } from './types.js';
import { toSlug } from '../utils/slug.js';

export class Sensor {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly address: number;
  readonly size: number;
  readonly factor: number;
  readonly unit: string;
  readonly signed: boolean;
  readonly deviceClass?: string;
  readonly stateClass?: string;
  readonly bitmask?: number;
  readonly offset: number;

  constructor(def: SensorDefinition) {
    this.id = def.id;
    this.name = def.name;
    this.slug = toSlug(def.name);
    this.address = def.address;
    this.size = def.size;
    this.factor = def.factor;
    this.unit = def.unit;
    this.signed = def.signed;
    this.deviceClass = def.deviceClass;
    this.stateClass = def.stateClass;
    this.bitmask = def.bitmask;
    this.offset = def.offset ?? 0;
  }

  /** All register addresses this sensor needs */
  get addresses(): number[] {
    return Array.from({ length: this.size }, (_, i) => this.address + i);
  }

  /** Convert raw register values to the final sensor value */
  resolve(registers: Map<number, number>): SensorValue {
    const raw = this.readRaw(registers);
    if (raw === null) return null;
    return this.convert(raw);
  }

  protected readRaw(registers: Map<number, number>): number | null {
    if (this.size === 1) {
      const v = registers.get(this.address);
      return v !== undefined ? v : null;
    }
    // 32-bit: Deye uses little-endian word order (low word at address, high word at address+1)
    const low = registers.get(this.address);
    const high = registers.get(this.address + 1);
    if (high === undefined || low === undefined) return null;
    return combine32(high, low);
  }

  protected convert(raw: number): number {
    let val = raw;

    if (this.bitmask !== undefined) {
      val = applyBitmask(val, this.bitmask);
    }

    if (this.signed) {
      val = this.size === 1 ? toSigned16(val) : toSigned32(val);
    }

    val -= this.offset;
    val = applyFactor(val, this.factor);

    return val;
  }
}

/**
 * Temperature sensor: raw value - 1000 = temp in 0.1°C
 * e.g. raw=1234 → (1234 - 1000) * 0.1 = 23.4°C
 */
export class TempSensor extends Sensor {
  constructor(def: Omit<SensorDefinition, 'factor' | 'unit' | 'signed' | 'offset'> & Partial<SensorDefinition>) {
    super({
      factor: 0.1,
      unit: '°C',
      signed: false,
      offset: 1000,
      ...def,
    });
  }
}

/**
 * Enum sensor: maps raw values to string labels
 */
export class EnumSensor extends Sensor {
  readonly enumMap: Record<number, string>;

  constructor(
    def: SensorDefinition & { enumMap: Record<number, string> },
  ) {
    super(def);
    this.enumMap = def.enumMap;
  }

  override resolve(registers: Map<number, number>): SensorValue {
    const raw = this.readRaw(registers);
    if (raw === null) return null;
    return this.enumMap[raw] ?? `unknown(${raw})`;
  }
}

/**
 * Binary sensor: extracts a single bit from a register
 */
export class BinarySensor extends Sensor {
  readonly bit: number;

  constructor(def: SensorDefinition & { bit: number }) {
    super(def);
    this.bit = def.bit;
  }

  override resolve(registers: Map<number, number>): SensorValue {
    const raw = this.readRaw(registers);
    if (raw === null) return null;
    return extractBit(raw, this.bit);
  }
}

/**
 * Math sensor: computes value from multiple other registers using a custom formula.
 * Used for derived values like total power = L1 + L2 + L3.
 */
export class MathSensor extends Sensor {
  private readonly sourceAddresses: number[];
  private readonly compute: (values: number[]) => number;

  constructor(
    def: SensorDefinition,
    sourceAddresses: number[],
    compute: (values: number[]) => number,
  ) {
    super(def);
    this.sourceAddresses = sourceAddresses;
    this.compute = compute;
  }

  override get addresses(): number[] {
    return this.sourceAddresses;
  }

  override resolve(registers: Map<number, number>): SensorValue {
    const values: number[] = [];
    for (const addr of this.sourceAddresses) {
      const v = registers.get(addr);
      if (v === undefined) return null;
      values.push(v);
    }
    return this.compute(values);
  }
}
