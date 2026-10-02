import { describe, it, expect, vi } from 'vitest';
import { publishDiscovery } from '../../src/ha-addon/mqtt-discovery.js';
import { Sensor } from '../../src/core/sensors/sensor.js';
import type { MqttClientWrapper } from '../../src/ha-addon/mqtt-client.js';
import type { InverterIdentity } from '../../src/core/inverter/types.js';

function fakeClient() {
  return { publish: vi.fn() } as unknown as MqttClientWrapper & { publish: ReturnType<typeof vi.fn> };
}

const inverter: InverterIdentity = {
  id: 'inv1',
  name: 'Inverter 1',
  model: 'deye-sg05lp3',
};

describe('publishDiscovery', () => {
  it('adds last_reset_value_template for dailyReset sensors', () => {
    const client = fakeClient();
    const sensor = new Sensor({
      id: 'day_pv_energy',
      name: 'Day PV Energy',
      address: 529,
      size: 1,
      factor: 0.1,
      unit: 'kWh',
      signed: false,
      deviceClass: 'energy',
      stateClass: 'total',
      dailyReset: true,
    });

    publishDiscovery(client, inverter, [sensor], 'deye', 'homeassistant');

    const [, payloadJson] = client.publish.mock.calls[0];
    const payload = JSON.parse(payloadJson);
    expect(payload.state_class).toBe('total');
    expect(payload.last_reset_value_template).toBe('{{ value_json.day_pv_energy_last_reset }}');
  });

  it('does not add last_reset_value_template for non-dailyReset sensors', () => {
    const client = fakeClient();
    const sensor = new Sensor({
      id: 'pv1_power',
      name: 'PV1 Power',
      address: 674,
      size: 1,
      factor: 1,
      unit: 'W',
      signed: false,
      deviceClass: 'power',
      stateClass: 'measurement',
    });

    publishDiscovery(client, inverter, [sensor], 'deye', 'homeassistant');

    const [, payloadJson] = client.publish.mock.calls[0];
    const payload = JSON.parse(payloadJson);
    expect(payload.last_reset_value_template).toBeUndefined();
  });
});
