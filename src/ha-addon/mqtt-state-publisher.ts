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

  const state: Record<string, number | string | boolean | null> = {};
  let hasStale = false;
  for (const reading of readings) {
    const slug = toSlug(reading.name);
    // Stale cached values must not be republished as fresh numbers: HA treats
    // any decrease on a total_increasing sensor as a meter reset, and a stale
    // reading overtaken by a lower fresh one would trigger a false negative
    // spike in the Energy dashboard. Publishing null renders as unknown/
    // unavailable in HA instead of a misleading number.
    if (reading.stale) {
      state[slug] = null;
      hasStale = true;
    } else {
      state[slug] = reading.value;
    }
  }
  if (hasStale) {
    state._stale = true;
  }

  const payload = JSON.stringify(state);
  log.debug(
    { inverterId, topic: stateTopic, sensors: readings.length },
    'Publishing state',
  );
  mqttClient.publish(stateTopic, payload);
}
