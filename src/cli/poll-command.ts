import type { AppConfig } from '../shared/config.js';
import { ModbusPool } from '../core/modbus/modbus-pool.js';
import { InverterPoller } from '../core/inverter/inverter-poller.js';
import { Scheduler } from '../core/scheduler/scheduler.js';
import { buildSensors } from '../core/definitions/index.js';
import type { InverterModel } from '../core/inverter/types.js';
import { formatOutput, type OutputFormat } from './output-formatter.js';
import { createLogger } from '../core/utils/logger.js';

const log = createLogger('poll-command');

export interface PollOptions {
  config: AppConfig;
  once: boolean;
  format: OutputFormat;
}

export async function runPoll(options: PollOptions): Promise<void> {
  const { config, once, format } = options;
  const pool = new ModbusPool();

  const scheduler = new Scheduler({
    readInterval: config.scheduler.readInterval,
    reportInterval: config.scheduler.reportInterval,
  });

  // Create pollers for each inverter
  for (const inv of config.inverters) {
    const sensors = buildSensors(inv.model as InverterModel, inv.sensors);
    const poller = new InverterPoller(
      {
        id: inv.id,
        name: inv.name ?? inv.id,
        model: inv.model as InverterModel,
        host: inv.host,
        port: inv.port,
        unitId: inv.unitId,
        serialNumber: inv.serialNumber,
      },
      sensors,
      pool,
    );
    scheduler.addPoller(poller);
  }

  // Handle shutdown
  const shutdown = async () => {
    log.info('Shutting down...');
    scheduler.stop();
    await pool.closeAll();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  if (once) {
    // One-shot mode
    const results = await scheduler.runOnce();
    for (const [inverterId, readings] of results) {
      console.log(formatOutput(inverterId, readings, format));
    }
    await pool.closeAll();
    return;
  }

  // Continuous mode
  scheduler.on('report', (inverterId, readings) => {
    console.log(formatOutput(inverterId, readings, format));
  });

  scheduler.on('error', (inverterId, error) => {
    console.error(`[${inverterId}] Error: ${error.message}`);
  });

  scheduler.start();
}
