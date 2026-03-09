import type { SensorDefinition } from '../sensors/types.js';
import { DEYE_SUN_3PHASE_LV } from './deye-sun-3phase-lv.js';

/**
 * Sensor definitions for Deye SUN-15K/20K (3-phase High Voltage).
 * Mostly the same registers as LV, with some additions for higher power ranges.
 */
export const DEYE_SUN_3PHASE_HV: SensorDefinition[] = [
  ...DEYE_SUN_3PHASE_LV,

  // Additional PV inputs for HV models (PV3 / PV4)
  {
    id: 'pv3_voltage',
    name: 'PV3 Voltage',
    address: 680,
    size: 1,
    factor: 0.1,
    unit: 'V',
    signed: false,
    deviceClass: 'voltage',
    stateClass: 'measurement',
  },
  {
    id: 'pv3_current',
    name: 'PV3 Current',
    address: 681,
    size: 1,
    factor: 0.1,
    unit: 'A',
    signed: false,
    deviceClass: 'current',
    stateClass: 'measurement',
  },
  {
    id: 'pv3_power',
    name: 'PV3 Power',
    address: 682,
    size: 1,
    factor: 1,
    unit: 'W',
    signed: false,
    deviceClass: 'power',
    stateClass: 'measurement',
  },
  {
    id: 'pv4_voltage',
    name: 'PV4 Voltage',
    address: 684,
    size: 1,
    factor: 0.1,
    unit: 'V',
    signed: false,
    deviceClass: 'voltage',
    stateClass: 'measurement',
  },
  {
    id: 'pv4_current',
    name: 'PV4 Current',
    address: 685,
    size: 1,
    factor: 0.1,
    unit: 'A',
    signed: false,
    deviceClass: 'current',
    stateClass: 'measurement',
  },
  {
    id: 'pv4_power',
    name: 'PV4 Power',
    address: 686,
    size: 1,
    factor: 1,
    unit: 'W',
    signed: false,
    deviceClass: 'power',
    stateClass: 'measurement',
  },
];
