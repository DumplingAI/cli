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
import { makeScrapeCommand } from './commands/scrape.js';
import { makeSearchCommand } from './commands/search.js';
import { makeTranscriptCommand } from './commands/transcript.js';
import {
  getFirstSearchPositionalArg,
  isKnownSearchSubcommand,
  isKnownSubcommand,
} from './utils/argv-shortcuts.js';

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
    .description('DumplingAI CLI — scrape, search, and extract content from the terminal')
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
  program.addCommand(makeScrapeCommand());
  program.addCommand(makeSearchCommand());
  program.addCommand(makeTranscriptCommand());

  // URL shortcut: if the first real arg looks like a URL and isn't a known subcommand,
  // forward to the scrape command
  const args = process.argv.slice(2);
  const firstArg = args[0];

  if (
    firstArg &&
    (firstArg.startsWith('http://') || firstArg.startsWith('https://')) &&
    !isKnownSubcommand(firstArg)
  ) {
    // Rewrite args to `scrape <url> [rest...]`
    process.argv.splice(2, 0, 'scrape');
  }

  // Support `dumplingai search <query>` by forwarding to `search web <query>`.
  const searchPositionalArg = firstArg === 'search' ? getFirstSearchPositionalArg(args) : undefined;
  if (
    firstArg === 'search' &&
    searchPositionalArg &&
    !isKnownSearchSubcommand(searchPositionalArg)
  ) {
    process.argv.splice(3, 0, 'web');
  }

  await program.parseAsync(process.argv);
}

main().catch((err: Error) => {
  process.stderr.write('Fatal error: ' + err.message + '\n');
  process.exit(1);
});
