import type { SensorReading } from '../core/sensors/types.js';

export type OutputFormat = 'table' | 'json' | 'csv';

export function formatOutput(
  inverterId: string,
  readings: SensorReading[],
  format: OutputFormat,
): string {
  switch (format) {
    case 'json':
      return formatJson(inverterId, readings);
    case 'csv':
      return formatCsv(inverterId, readings);
    case 'table':
    default:
      return formatTable(inverterId, readings);
  }
}

function formatTable(inverterId: string, readings: SensorReading[]): string {
  const header = `\n=== ${inverterId} ===`;
  const colName = 30;
  const colValue = 15;
  const colUnit = 8;

  const divider = '-'.repeat(colName + colValue + colUnit + 6);
  const headerRow = [
    'Sensor'.padEnd(colName),
    'Value'.padStart(colValue),
    'Unit'.padStart(colUnit),
  ].join(' | ');

  const rows = readings.map((r) =>
    [
      r.name.padEnd(colName),
      String(r.value).padStart(colValue),
      r.unit.padStart(colUnit),
    ].join(' | '),
  );

  return [header, divider, headerRow, divider, ...rows, divider].join('\n');
}

function formatJson(inverterId: string, readings: SensorReading[]): string {
  const data = {
    inverterId,
    timestamp: new Date().toISOString(),
    sensors: readings.map((r) => ({
      id: r.sensorId,
      name: r.name,
      value: r.value,
      unit: r.unit,
    })),
  };
  return JSON.stringify(data, null, 2);
}

function formatCsv(inverterId: string, readings: SensorReading[]): string {
  const header = 'inverter_id,sensor_id,name,value,unit,timestamp';
  const ts = new Date().toISOString();
  const rows = readings.map(
    (r) =>
      `${inverterId},${r.sensorId},"${r.name}",${r.value},${r.unit},${ts}`,
  );
  return [header, ...rows].join('\n');
}
