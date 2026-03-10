import { Command } from 'commander';

import { DumplingAIClient } from '../client/api.js';
import { requireAuth } from '../utils/auth.js';
import { getApiUrl } from '../utils/config.js';
import { printResult } from '../utils/output.js';

export function makeBalanceCommand(): Command {
  return new Command('balance')
    .description('Get balance and budget information for the authenticated API key')
    .option('--api-key <key>', 'Override API key for this request')
    .action(async (opts: { apiKey?: string }) => {
      const apiKey = await requireAuth(opts.apiKey);
      const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });
      const result = await client.getBalance();
      printResult(result);
    });
}
