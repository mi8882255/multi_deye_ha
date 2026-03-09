import type { SensorDefinition } from '../sensors/types.js';

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
