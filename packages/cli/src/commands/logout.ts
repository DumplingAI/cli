import { Command } from 'commander';
import { deleteCredential } from '../utils/auth.js';
import { printStatus } from '../utils/output.js';

export function makeLogoutCommand(): Command {
  return new Command('logout')
    .description('Remove stored API credentials')
    .action(async () => {
      await deleteCredential();
      printStatus('Logged out. Credentials removed from all storage locations.');
    });
}
