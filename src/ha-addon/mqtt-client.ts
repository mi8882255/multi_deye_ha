import mqtt from 'mqtt';
import type { MqttClient as IMqttClient } from 'mqtt';
import type { MqttConfig } from '../shared/config.js';
import { createLogger } from '../core/utils/logger.js';

const log = createLogger('mqtt-client');

export class MqttClientWrapper {
  private client: IMqttClient | null = null;
  private config: MqttConfig;

  constructor(config: MqttConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url = `mqtt://${this.config.host}:${this.config.port}`;
      log.info({ url }, 'Connecting to MQTT broker');

      this.client = mqtt.connect(url, {
        username: this.config.username,
        password: this.config.password,
        will: {
          topic: `${this.config.topicPrefix}/status`,
          payload: Buffer.from('offline'),
          qos: 1,
          retain: true,
        },
      });

      this.client.on('connect', () => {
        log.info('MQTT connected');
        this.publish(`${this.config.topicPrefix}/status`, 'online', true);
        resolve();
      });

      this.client.on('error', (err) => {
        log.error({ err: err.message }, 'MQTT error');
        reject(err);
      });

      this.client.on('reconnect', () => {
        log.warn('MQTT reconnecting...');
      });
    });
  }

  publish(topic: string, payload: string, retain = false): void {
    if (!this.client?.connected) {
      log.warn({ topic }, 'MQTT not connected, skipping publish');
      return;
    }
    this.client.publish(topic, payload, { qos: 1, retain });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.publish(`${this.config.topicPrefix}/status`, 'offline', true);
      await this.client.endAsync();
      log.info('MQTT disconnected');
    }
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
