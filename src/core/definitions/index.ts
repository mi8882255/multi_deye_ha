import type { SensorDefinition } from '../sensors/types.js';
import { Sensor, EnumSensor, TempSensor } from '../sensors/sensor.js';
import { DEYE_SUN_3PHASE_LV } from './deye-sun-3phase-lv.js';
import { DEYE_SUN_3PHASE_HV } from './deye-sun-3phase-hv.js';
import { DEYE_SG05LP3 } from './deye-sg05lp3.js';
import { DEYE_HYBRID_1P } from './deye-hybrid-1p.js';
import { DEYE_SG02LP1 } from './deye-sg02lp1.js';
import { DEYE_MICRO } from './deye-micro.js';
import type { InverterModel } from '../inverter/types.js';

const MODEL_MAP: Record<InverterModel, SensorDefinition[]> = {
  'deye-sun-3phase-lv': DEYE_SUN_3PHASE_LV,
  'deye-sun-3phase-hv': DEYE_SUN_3PHASE_HV,
  'deye-sg05lp3': DEYE_SG05LP3,
  'deye-hybrid-1p': DEYE_HYBRID_1P,
  'deye-sg02lp1': DEYE_SG02LP1,
  'deye-micro': DEYE_MICRO,
};

export function getDefinitions(model: InverterModel): SensorDefinition[] {
  const defs = MODEL_MAP[model];
  if (!defs) {
    throw new Error(`Unknown inverter model: ${model}`);
  }
  return defs;
}

export function getSupportedModels(): InverterModel[] {
  return Object.keys(MODEL_MAP) as InverterModel[];
}

/**
 * Build Sensor instances from definitions, optionally filtering by sensor IDs.
 */
export function buildSensors(
  model: InverterModel,
  filterIds?: string[],
): Sensor[] {
  let defs = getDefinitions(model);

  if (filterIds && filterIds.length > 0) {
    const idSet = new Set(filterIds);
    defs = defs.filter((d) => idSet.has(d.id));
  }

  return defs.map((def) => {
    if (def.enumMap) {
      return new EnumSensor(def as SensorDefinition & { enumMap: Record<number, string> });
    }
    if (def.offset === 1000 && def.unit === '°C') {
      return new TempSensor(def);
    }
    return new Sensor(def);
  });
}
