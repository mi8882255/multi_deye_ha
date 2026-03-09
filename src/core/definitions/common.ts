import type { SensorDefinition } from '../sensors/types.js';

/**
 * Virtual total mapping: unified sensor IDs across all inverter models.
 * Each entry maps a virtual sensor to a model-specific register address.
 */
export interface VirtualTotalMapping {
  /** Total PV/DC power */
  solar: { address: number; size?: number };
  /** Total grid power (signed: + import, - export) */
  grid?: { address: number; size?: number; factor?: number };
  /** Total load/consumption */
  load?: { address: number; size?: number; signed?: boolean };
  /** Total inverter output */
  inverter: { address: number; size?: number };
  /** Total battery power (signed: + charge, - discharge) */
  battery?: { address: number; size?: number };
  /** Total generator/AUX power */
  generator?: { address: number; size?: number };
}

/** Create unified virtual total sensors with `vt_` prefix */
export function createVirtualTotals(mapping: VirtualTotalMapping): SensorDefinition[] {
  const defs: SensorDefinition[] = [
    {
      id: 'vt_solar_power',
      name: 'Total Solar Power',
      address: mapping.solar.address,
      size: mapping.solar.size ?? 1,
      factor: 1,
      unit: 'W',
      signed: false,
      deviceClass: 'power',
      stateClass: 'measurement',
    },
    {
      id: 'vt_inverter_power',
      name: 'Total Inverter Power',
      address: mapping.inverter.address,
      size: mapping.inverter.size ?? 1,
      factor: 1,
      unit: 'W',
      signed: true,
      deviceClass: 'power',
      stateClass: 'measurement',
    },
  ];

  if (mapping.grid) {
    defs.push({
      id: 'vt_grid_power',
      name: 'Total Grid Power',
      address: mapping.grid.address,
      size: mapping.grid.size ?? 1,
      factor: mapping.grid.factor ?? 1,
      unit: 'W',
      signed: true,
      deviceClass: 'power',
      stateClass: 'measurement',
    });
  }

  if (mapping.load) {
    defs.push({
      id: 'vt_load_power',
      name: 'Total Load Power',
      address: mapping.load.address,
      size: mapping.load.size ?? 1,
      factor: 1,
      unit: 'W',
      signed: mapping.load.signed ?? false,
      deviceClass: 'power',
      stateClass: 'measurement',
    });
  }

  if (mapping.battery) {
    defs.push({
      id: 'vt_battery_power',
      name: 'Total Battery Power',
      address: mapping.battery.address,
      size: mapping.battery.size ?? 1,
      factor: 1,
      unit: 'W',
      signed: true,
      deviceClass: 'power',
      stateClass: 'measurement',
    });
  }

  if (mapping.generator) {
    defs.push({
      id: 'vt_generator_power',
      name: 'Total Generator Power',
      address: mapping.generator.address,
      size: mapping.generator.size ?? 1,
      factor: 1,
      unit: 'W',
      signed: true,
      deviceClass: 'power',
      stateClass: 'measurement',
    });
  }

  return defs;
}

/** Common registers shared across Deye 3-phase models */
export const COMMON_SENSORS: SensorDefinition[] = [
  // Device info
  {
    id: 'device_type',
    name: 'Device Type',
    address: 0,
    size: 1,
    factor: 1,
    unit: '',
    signed: false,
  },
  {
    id: 'comm_protocol',
    name: 'Communication Protocol',
    address: 1,
    size: 1,
    factor: 1,
    unit: '',
    signed: false,
  },
  {
    id: 'serial_high',
    name: 'Serial Number High',
    address: 3,
    size: 2,
    factor: 1,
    unit: '',
    signed: false,
  },
  {
    id: 'rated_power',
    name: 'Rated Power',
    address: 20,
    size: 1,
    factor: 1,
    unit: 'W',
    signed: false,
    deviceClass: 'power',
  },
];
