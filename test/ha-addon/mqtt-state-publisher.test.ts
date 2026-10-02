import { describe, it, expect, vi } from 'vitest';
import { publishState } from '../../src/ha-addon/mqtt-state-publisher.js';
import type { MqttClientWrapper } from '../../src/ha-addon/mqtt-client.js';
import type { SensorReading } from '../../src/core/sensors/types.js';

function fakeClient() {
  return { publish: vi.fn() } as unknown as MqttClientWrapper & { publish: ReturnType<typeof vi.fn> };
}

function reading(overrides: Partial<SensorReading>): SensorReading {
  return {
    sensorId: 'day_pv_energy',
    name: 'Day PV Energy',
    value: 22.7,
    unit: 'kWh',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('publishState', () => {
  it('publishes fresh numeric values as-is', () => {
    const client = fakeClient();
    publishState(client, 'inv1', [reading({})], 'deye');

    const [, payload] = client.publish.mock.calls[0];
    expect(JSON.parse(payload)).toEqual({ day_pv_energy: 22.7 });
  });

  it('publishes null instead of a stale cached value, so HA does not record a false drop', () => {
    const client = fakeClient();
    publishState(client, 'inv1', [reading({ value: 22.7, stale: true })], 'deye');

    const [, payload] = client.publish.mock.calls[0];
    expect(JSON.parse(payload)).toEqual({ day_pv_energy: null, _stale: true });
  });

  it('does not set _stale when all readings are fresh', () => {
    const client = fakeClient();
    publishState(client, 'inv1', [reading({})], 'deye');

    const [, payload] = client.publish.mock.calls[0];
    expect(JSON.parse(payload)._stale).toBeUndefined();
  });
});
