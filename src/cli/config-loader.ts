import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { z } from 'zod';
import type { AppConfig } from '../shared/config.js';
import { DEFAULT_SCHEDULER, DEFAULT_MQTT } from '../shared/config.js';
import { ConfigValidationError } from '../shared/errors.js';

const InverterSchema = z.object({
  id: z.string(),
  host: z.string(),
  port: z.number().default(502),
  unitId: z.number().min(1).max(247).default(1),
  model: z.enum(['deye-sun-3phase-lv', 'deye-sun-3phase-hv', 'deye-sg05lp3', 'deye-hybrid-1p', 'deye-sg02lp1', 'deye-micro']),
  name: z.string().optional(),
  sensors: z.array(z.string()).optional(),
  serialNumber: z.number().optional(),
  retries: z.number().min(0).optional(),
  retryMinDelay: z.number().min(0).optional(),
  retryMaxDelay: z.number().min(0).optional(),
});

const MqttSchema = z.object({
  host: z.string().default(DEFAULT_MQTT.host),
  port: z.number().default(DEFAULT_MQTT.port),
  username: z.string().optional(),
  password: z.string().optional(),
  topicPrefix: z.string().default(DEFAULT_MQTT.topicPrefix),
  discoveryPrefix: z.string().default(DEFAULT_MQTT.discoveryPrefix),
});

const SchedulerSchema = z.object({
  readInterval: z.number().min(1).default(DEFAULT_SCHEDULER.readInterval),
  reportInterval: z.number().min(1).default(DEFAULT_SCHEDULER.reportInterval),
  gapTolerance: z.number().min(1).default(DEFAULT_SCHEDULER.gapTolerance),
  staleThresholdSeconds: z.number().min(1).default(DEFAULT_SCHEDULER.staleThresholdSeconds),
  slowPollMultiplier: z.number().min(1).default(DEFAULT_SCHEDULER.slowPollMultiplier),
});

const AppConfigSchema = z.object({
  inverters: z.array(InverterSchema).min(1),
  mqtt: MqttSchema.optional(),
  scheduler: SchedulerSchema.default(DEFAULT_SCHEDULER),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export function loadConfig(filePath: string): AppConfig {
  let raw: unknown;
  try {
    const content = readFileSync(filePath, 'utf-8');
    raw = yaml.load(content);
  } catch (err) {
    throw new ConfigValidationError(
      `Failed to read config file ${filePath}: ${(err as Error).message}`,
    );
  }

  const result = AppConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new ConfigValidationError(`Config validation failed:\n${issues}`);
  }

  return result.data;
}
