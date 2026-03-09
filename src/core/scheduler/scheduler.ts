import { EventEmitter } from 'node:events';
import type { InverterPoller } from '../inverter/inverter-poller.js';
import type { SchedulerOptions } from './types.js';
import { createLogger } from '../utils/logger.js';
import type { SensorReading } from '../sensors/types.js';

const log = createLogger('scheduler');

export interface SchedulerEvents {
  report: [inverterId: string, readings: SensorReading[]];
  tick: [type: 'read' | 'report'];
  error: [inverterId: string, error: Error];
}

/**
 * Tick-based scheduler that orchestrates polling of multiple inverters.
 * Separates read cycles (data acquisition) from report cycles (data output).
 */
export class Scheduler extends EventEmitter {
  private pollers: InverterPoller[] = [];
  private options: SchedulerOptions;
  private readTimer: ReturnType<typeof setInterval> | null = null;
  private reportTimer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(options: SchedulerOptions) {
    super();
    this.options = options;
  }

  addPoller(poller: InverterPoller): void {
    this.pollers.push(poller);
  }

  /**
   * Start the scheduler. Polls all inverters in parallel.
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    log.info(
      {
        readInterval: this.options.readInterval,
        reportInterval: this.options.reportInterval,
        inverters: this.pollers.length,
      },
      'Scheduler started',
    );

    // Perform initial read immediately
    void this.doReadCycle();

    this.readTimer = setInterval(
      () => void this.doReadCycle(),
      this.options.readInterval * 1000,
    );

    this.reportTimer = setInterval(
      () => void this.doReportCycle(),
      this.options.reportInterval * 1000,
    );
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.readTimer) {
      clearInterval(this.readTimer);
      this.readTimer = null;
    }
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    log.info('Scheduler stopped');
  }

  /**
   * Perform a single read cycle: poll all inverters in parallel.
   */
  async doReadCycle(): Promise<void> {
    this.emit('tick', 'read');

    const results = await Promise.allSettled(
      this.pollers.map((p) => p.poll()),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const id = this.pollers[i].identity.id;
        log.error({ inverterId: id, err: result.reason }, 'Poller failed');
        this.emit('error', id, result.reason as Error);
      }
    }
  }

  /**
   * Perform a report cycle: emit current state for all inverters.
   */
  async doReportCycle(): Promise<void> {
    this.emit('tick', 'report');

    for (const poller of this.pollers) {
      const sensors = poller.registry.getAll();
      const readings = poller.state.getAllReadings(sensors);
      if (readings.length > 0) {
        this.emit('report', poller.identity.id, readings);
      }
      poller.state.clearChanges();
    }
  }

  /**
   * Do a one-shot read + report (useful for CLI --once mode).
   */
  async runOnce(): Promise<Map<string, SensorReading[]>> {
    const result = new Map<string, SensorReading[]>();

    const results = await Promise.allSettled(
      this.pollers.map((p) => p.poll()),
    );

    for (let i = 0; i < results.length; i++) {
      const poller = this.pollers[i];
      if (results[i].status === 'fulfilled') {
        const sensors = poller.registry.getAll();
        result.set(poller.identity.id, poller.state.getAllReadings(sensors));
      }
    }

    return result;
  }

  get isRunning(): boolean {
    return this.running;
  }
}
