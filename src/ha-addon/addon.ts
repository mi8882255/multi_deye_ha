#!/usr/bin/env node
import { loadHaConfigWithMqtt } from './ha-config-loader.js';
import { MqttClientWrapper } from './mqtt-client.js';
import { publishDiscovery } from './mqtt-discovery.js';
import { publishState } from './mqtt-state-publisher.js';
import { ModbusPool } from '../core/modbus/modbus-pool.js';
import { InverterPoller } from '../core/inverter/inverter-poller.js';
import { Scheduler } from '../core/scheduler/scheduler.js';
import { buildSensors } from '../core/definitions/index.js';
import type { InverterModel } from '../core/inverter/types.js';
import { createLogger } from '../core/utils/logger.js';

const log = createLogger('ha-addon');

async function main() {
  log.info('Starting Deye HA Addon');

  const config = await loadHaConfigWithMqtt();

  if (!config.mqtt) {
    throw new Error('MQTT configuration is required for HA addon');
  }

  // Connect MQTT
  const mqttClient = new MqttClientWrapper(config.mqtt);
  await mqttClient.connect();

  // Setup Modbus pool
  const pool = new ModbusPool();

  // Setup scheduler
  const scheduler = new Scheduler({
    readInterval: config.scheduler.readInterval,
    reportInterval: config.scheduler.reportInterval,
  });

  // Create pollers and publish discovery for each inverter
  for (const inv of config.inverters) {
    const model = inv.model as InverterModel;
    const sensors = buildSensors(model, inv.sensors);

    const identity = {
      id: inv.id,
      name: inv.name ?? inv.id,
      model,
      host: inv.host,
      port: inv.port,
      unitId: inv.unitId,
      serialNumber: inv.serialNumber,
    };

    const poller = new InverterPoller(identity, sensors, pool, {
      gapTolerance: config.scheduler.gapTolerance,
      staleThresholdSeconds: config.scheduler.staleThresholdSeconds,
      slowPollMultiplier: config.scheduler.slowPollMultiplier,
      modbusOptions: {
        retries: inv.retries,
        retryMinDelay: inv.retryMinDelay,
        retryMaxDelay: inv.retryMaxDelay,
      },
    });
    scheduler.addPoller(poller);

    // Publish HA discovery
    publishDiscovery(
      mqttClient,
      identity,
      sensors,
      config.mqtt!.topicPrefix,
      config.mqtt!.discoveryPrefix,
    );
  }

  // On report, publish state via MQTT
  scheduler.on('report', (inverterId, readings) => {
    publishState(mqttClient, inverterId, readings, config.mqtt!.topicPrefix);
  });

  scheduler.on('error', (inverterId, error) => {
    log.error({ inverterId, err: error.message }, 'Inverter error');
  });

  // Handle shutdown
  const shutdown = async () => {
    log.info('Shutting down HA addon...');
    scheduler.stop();
    pool.closeAll();
    await mqttClient.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  // Start
  scheduler.start();
  log.info('HA Addon running');
}

main().catch((err) => {
  log.fatal({ err: (err as Error).message }, 'Fatal error');
  process.exit(1);
});
