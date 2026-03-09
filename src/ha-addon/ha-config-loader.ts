import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { AppConfig } from '../shared/config.js';
import { DEFAULT_SCHEDULER, DEFAULT_MQTT } from '../shared/config.js';
import { ConfigValidationError } from '../shared/errors.js';
import { createLogger } from '../core/utils/logger.js';

const log = createLogger('ha-config-loader');

/**
 * HA addon receives config from /data/options.json.
 * MQTT credentials come from the Supervisor API automatically.
 */
const HaOptionsSchema = z.object({
  inverters: z.array(
    z.object({
      id: z.string(),
      host: z.string(),
      port: z.number().default(502),
      unitId: z.number().default(1),
      model: z.enum(['deye-sun-3phase-lv', 'deye-sun-3phase-hv', 'deye-sg05lp3', 'deye-hybrid-1p', 'deye-sg02lp1', 'deye-micro']),
      name: z.string().optional(),
      sensors: z.array(z.string()).optional(),
      serialNumber: z.number().optional(),
      retries: z.number().min(0).optional(),
      retryMinDelay: z.number().min(0).optional(),
      retryMaxDelay: z.number().min(0).optional(),
    }),
  ),
  mqtt_host: z.string().default('core-mosquitto'),
  mqtt_port: z.number().default(1883),
  mqtt_username: z.string().optional(),
  mqtt_password: z.string().optional(),
  topic_prefix: z.string().default('deye'),
  discovery_prefix: z.string().default('homeassistant'),
  read_interval: z.number().default(DEFAULT_SCHEDULER.readInterval),
  report_interval: z.number().default(DEFAULT_SCHEDULER.reportInterval),
  gap_tolerance: z.number().min(1).default(DEFAULT_SCHEDULER.gapTolerance),
  stale_threshold_seconds: z.number().min(1).default(DEFAULT_SCHEDULER.staleThresholdSeconds),
  slow_poll_multiplier: z.number().min(1).default(DEFAULT_SCHEDULER.slowPollMultiplier),
  log_level: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});

interface SupervisorMqttResponse {
  data: {
    host: string;
    port: number;
    ssl: boolean;
    username: string;
    password: string;
    protocol: string;
    addon: string;
  };
}

/**
 * Fetch MQTT credentials from the HA Supervisor API.
 * Available when addon declares `services: [mqtt:want]` in config.yaml.
 */
async function fetchSupervisorMqtt(): Promise<{ host: string; port: number; username: string; password: string } | null> {
  const token = process.env.SUPERVISOR_TOKEN;
  if (!token) {
    log.debug('No SUPERVISOR_TOKEN, skipping Supervisor MQTT discovery');
    return null;
  }

  try {
    const res = await fetch('http://supervisor/services/mqtt', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      log.warn({ status: res.status }, 'Supervisor MQTT service not available');
      return null;
    }
    const json = (await res.json()) as SupervisorMqttResponse;
    log.info({ host: json.data.host, port: json.data.port }, 'Got MQTT credentials from Supervisor');
    return {
      host: json.data.host,
      port: json.data.port,
      username: json.data.username,
      password: json.data.password,
    };
  } catch (err) {
    log.warn({ err: (err as Error).message }, 'Failed to fetch Supervisor MQTT config');
    return null;
  }
}

export function loadHaConfig(optionsPath = '/data/options.json'): AppConfig {
  let raw: unknown;
  try {
    const content = readFileSync(optionsPath, 'utf-8');
    raw = JSON.parse(content);
  } catch (err) {
    throw new ConfigValidationError(
      `Failed to read HA options: ${(err as Error).message}`,
    );
  }

  const result = HaOptionsSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new ConfigValidationError(`HA config validation failed:\n${issues}`);
  }

  const opts = result.data;

  return {
    inverters: opts.inverters,
    mqtt: {
      host: opts.mqtt_host,
      port: opts.mqtt_port,
      username: opts.mqtt_username,
      password: opts.mqtt_password,
      topicPrefix: opts.topic_prefix,
      discoveryPrefix: opts.discovery_prefix,
    },
    scheduler: {
      readInterval: opts.read_interval,
      reportInterval: opts.report_interval,
      gapTolerance: opts.gap_tolerance,
      staleThresholdSeconds: opts.stale_threshold_seconds,
      slowPollMultiplier: opts.slow_poll_multiplier,
    },
    logLevel: opts.log_level,
  };
}

/**
 * Load HA config with automatic MQTT credential discovery from Supervisor.
 */
export async function loadHaConfigWithMqtt(optionsPath = '/data/options.json'): Promise<AppConfig> {
  const config = loadHaConfig(optionsPath);

  // If no username provided, try to get from Supervisor API
  if (!config.mqtt?.username) {
    const supervisorMqtt = await fetchSupervisorMqtt();
    if (supervisorMqtt && config.mqtt) {
      config.mqtt.host = supervisorMqtt.host;
      config.mqtt.port = supervisorMqtt.port;
      config.mqtt.username = supervisorMqtt.username;
      config.mqtt.password = supervisorMqtt.password;
    }
  }

  return config;
}
