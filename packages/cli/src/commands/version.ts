import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function getCliVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = path.resolve(fileURLToPath(import.meta.url), '../../../package.json');
    const pkg = require(pkgPath) as { version: string };
    return pkg.version;
  } catch {
    return '0.1.0';
  }
}

export function makeVersionCommand(): Command {
  return new Command('version')
    .description('Print the CLI version')
    .action(() => {
      process.stdout.write(getCliVersion() + '\n');
    });
}
