#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './config-loader.js';
import { runPoll } from './poll-command.js';
import { getSupportedModels, getDefinitions } from '../core/definitions/index.js';
import type { OutputFormat } from './output-formatter.js';
import type { InverterModel } from '../core/inverter/types.js';

const program = new Command();

program
  .name('deye-reader')
  .description('Deye Multi-Inverter Reader — read inverter data via Modbus TCP')
  .version('1.0.0');

program
  .command('poll')
  .description('Poll inverters and display readings')
  .requiredOption('-c, --config <path>', 'Path to config YAML file')
  .option('--once', 'Read once and exit', false)
  .option('-f, --format <format>', 'Output format: table, json, csv', 'table')
  .action(async (opts: { config: string; once: boolean; format: string }) => {
    try {
      const config = loadConfig(opts.config);
      await runPoll({
        config,
        once: opts.once,
        format: opts.format as OutputFormat,
      });
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('discover')
  .description('List supported models and their sensors')
  .option('-m, --model <model>', 'Show sensors for a specific model')
  .action((opts: { model?: string }) => {
    if (opts.model) {
      const model = opts.model as InverterModel;
      try {
        const defs = getDefinitions(model);
        console.log(`\nModel: ${model} (${defs.length} sensors)\n`);
        console.log(
          [
            'ID'.padEnd(30),
            'Name'.padEnd(30),
            'Address'.padStart(8),
            'Unit'.padStart(6),
          ].join(' | '),
        );
        console.log('-'.repeat(80));
        for (const d of defs) {
          console.log(
            [
              d.id.padEnd(30),
              d.name.padEnd(30),
              String(d.address).padStart(8),
              d.unit.padStart(6),
            ].join(' | '),
          );
        }
      } catch (err) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }
    } else {
      const models = getSupportedModels();
      console.log('\nSupported models:');
      for (const m of models) {
        const defs = getDefinitions(m);
        console.log(`  ${m} — ${defs.length} sensors`);
      }
      console.log('\nUse --model <name> to list sensors for a model.');
    }
  });

program.parse();
