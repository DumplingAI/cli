#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { makeInitCommand } from './commands/init.js';
import { makeLoginCommand } from './commands/login.js';
import { makeLogoutCommand } from './commands/logout.js';
import { makeStatusCommand } from './commands/status.js';
import { makeViewConfigCommand } from './commands/view-config.js';
import { makeVersionCommand } from './commands/version.js';
import { makeEnvPullCommand } from './commands/env-pull.js';
import { makeSetupSkillCommand } from './commands/setup-skill.js';
import { makeCatalogCommand } from './commands/catalog.js';
import { makeRunCommand } from './commands/run.js';
import { makeBalanceCommand } from './commands/balance.js';
import { makeUsageCommand } from './commands/usage.js';
import { makeTransactionsCommand } from './commands/transactions.js';

function getCliVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = path.resolve(fileURLToPath(import.meta.url), '../../package.json');
    const pkg = require(pkgPath) as { version: string };
    return pkg.version;
  } catch {
    return '0.1.0';
  }
}

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('dumplingai')
    .description('DumplingAI CLI — discover and execute Unified API Platform capabilities')
    .version(getCliVersion(), '-V, --version', 'Print version')
    .allowUnknownOption(false);

  // Register all subcommands
  program.addCommand(makeInitCommand());
  program.addCommand(makeLoginCommand());
  program.addCommand(makeLogoutCommand());
  program.addCommand(makeStatusCommand());
  program.addCommand(makeViewConfigCommand());
  program.addCommand(makeVersionCommand());
  program.addCommand(makeEnvPullCommand());
  program.addCommand(makeSetupSkillCommand());
  program.addCommand(makeCatalogCommand());
  program.addCommand(makeRunCommand());
  program.addCommand(makeBalanceCommand());
  program.addCommand(makeUsageCommand());
  program.addCommand(makeTransactionsCommand());

  await program.parseAsync(process.argv);
}

main().catch((err: Error) => {
  process.stderr.write('Fatal error: ' + err.message + '\n');
  process.exit(1);
});
