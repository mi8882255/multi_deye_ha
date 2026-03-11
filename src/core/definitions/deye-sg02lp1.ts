import type { SensorDefinition } from '../sensors/types.js';
import { DEYE_HYBRID_1P } from './deye-hybrid-1p.js';

/**
 * Sensor definitions for Deye single-phase hybrid inverters with 3 MPPT.
 * Models: SUN-8K/10K/12K/16K-SG02LP1-EU, SUN-8K÷16K-SG01LP1-EU.
 *
 * Same register map as deye-hybrid-1p, with additions:
 * - PV3 (3rd MPPT) at registers 188/113/114
 * - Grid total power factor is x10 instead of x1 (for >8kW models)
 */
export const DEYE_SG02LP1: SensorDefinition[] = [
  // Take all sensors from the 2-MPPT hybrid, but override grid power factor
  ...DEYE_HYBRID_1P.filter((s) => s.id !== 'grid_total_power' && s.id !== 'vt_grid_power' && s.id !== 'vt_solar_power' && s.id !== 'pv_total_power'),

  // Override: PV Total = PV1 + PV2 + PV3
  {
    id: 'vt_solar_power',
    name: 'VT Solar Power',
    address: 0,
    size: 1,
    factor: 1,
    unit: 'W',
    signed: false,
    deviceClass: 'power',
    stateClass: 'measurement',
    sumOf: [186, 187, 188],
  },
  {
    id: 'pv_total_power',
    name: 'PV Total Power',
    address: 0,
    size: 1,
    factor: 1,
    unit: 'W',
    signed: false,
    deviceClass: 'power',
    stateClass: 'measurement',
    sumOf: [186, 187, 188],
  },

  // Grid total power: factor 10 for high-power single-phase models
  {
    id: 'vt_grid_power',
    name: 'VT Grid Power',
    address: 169,
    size: 1,
    factor: 10,
    unit: 'W',
    signed: true,
    deviceClass: 'power',
    stateClass: 'measurement',
  },
  {
    id: 'grid_total_power',
    name: 'Grid Total Power',
    address: 169,
    size: 1,
    factor: 10,
    unit: 'W',
    signed: true,
    deviceClass: 'power',
    stateClass: 'measurement',
  },

  // PV3 (3rd MPPT)
  {
    id: 'pv3_power',
    name: 'PV3 Power',
    address: 188,
    size: 1,
    factor: 1,
    unit: 'W',
    signed: false,
    deviceClass: 'power',
    stateClass: 'measurement',
  },
  {
    id: 'pv3_voltage',
    name: 'PV3 Voltage',
    address: 113,
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
    address: 114,
    size: 1,
    factor: 0.1,
    unit: 'A',
    signed: false,
    deviceClass: 'current',
    stateClass: 'measurement',
  },
];
