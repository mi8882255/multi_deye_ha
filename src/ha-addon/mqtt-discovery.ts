import { BinarySensor, type Sensor } from '../core/sensors/sensor.js';
import type { InverterIdentity } from '../core/inverter/types.js';
import type { MqttClientWrapper } from './mqtt-client.js';
import { createLogger } from '../core/utils/logger.js';

const log = createLogger('mqtt-discovery');

interface DiscoveryPayload {
  name: string;
  unique_id: string;
  state_topic: string;
  value_template: string;
  device: {
    identifiers: string[];
    name: string;
    manufacturer: string;
    model: string;
  };
  unit_of_measurement?: string;
  device_class?: string;
  state_class?: string;
  availability_topic: string;
}

/**
 * Publish HA MQTT auto-discovery messages for all sensors of an inverter.
 */
export function publishDiscovery(
  mqttClient: MqttClientWrapper,
  inverter: InverterIdentity,
  sensors: Sensor[],
  topicPrefix: string,
  discoveryPrefix: string,
): void {
  const deviceId = inverter.id;

  for (const sensor of sensors) {
    const uniqueId = `${deviceId}_${sensor.slug}`;
    const stateTopic = `${topicPrefix}/${deviceId}/state`;
    const componentType = getComponentType(sensor);

    const payload: DiscoveryPayload = {
      name: `${inverter.name} ${sensor.name}`,
      unique_id: uniqueId,
      state_topic: stateTopic,
      value_template: `{{ value_json.${sensor.slug} }}`,
      device: {
        identifiers: [deviceId],
        name: inverter.name,
        manufacturer: 'Deye',
        model: inverter.model,
      },
      availability_topic: `${topicPrefix}/status`,
    };

    if (sensor.unit) {
      payload.unit_of_measurement = sensor.unit;
    }
    if (sensor.deviceClass) {
      payload.device_class = sensor.deviceClass;
    }
    if (sensor.stateClass) {
      payload.state_class = sensor.stateClass;
    }

    const discoveryTopic = `${discoveryPrefix}/${componentType}/${deviceId}/${sensor.slug}/config`;

    log.debug({ discoveryTopic, uniqueId }, 'Publishing discovery');
    mqttClient.publish(discoveryTopic, JSON.stringify(payload), true);
  }

  log.info(
    { inverterId: deviceId, sensors: sensors.length },
    'Discovery published',
  );
}

function getComponentType(sensor: Sensor): string {
  if (sensor instanceof BinarySensor) {
    return 'binary_sensor';
  }
  return 'sensor';
}
