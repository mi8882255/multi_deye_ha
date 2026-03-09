import type { SensorReading } from '../core/sensors/types.js';
import type { MqttClientWrapper } from './mqtt-client.js';
import { toSlug } from '../core/utils/slug.js';
import { createLogger } from '../core/utils/logger.js';

const log = createLogger('mqtt-state-publisher');

/**
 * Publish sensor readings as a single JSON state message per inverter.
 */
export function publishState(
  mqttClient: MqttClientWrapper,
  inverterId: string,
  readings: SensorReading[],
  topicPrefix: string,
): void {
  const stateTopic = `${topicPrefix}/${inverterId}/state`;

  const state: Record<string, number | string> = {};
  for (const reading of readings) {
    const slug = toSlug(reading.name);
    state[slug] = reading.value;
  }

  const payload = JSON.stringify(state);
  log.debug(
    { inverterId, topic: stateTopic, sensors: readings.length },
    'Publishing state',
  );
  mqttClient.publish(stateTopic, payload);
}
