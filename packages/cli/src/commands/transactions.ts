import { Command } from 'commander';

import { DumplingAIClient } from '../client/api.js';
import { requireAuth } from '../utils/auth.js';
import { getApiUrl } from '../utils/config.js';
import { exitWithError, printResult } from '../utils/output.js';

function parseOptionalInt(value?: string, flagName?: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    exitWithError(`Invalid ${flagName}. Expected a positive integer.`);
  }
  return parsed;
}

export function makeTransactionsCommand(): Command {
  return new Command('transactions')
    .description('Get credit transaction history for the authenticated API key')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Page size')
    .option('--api-key <key>', 'Override API key for this request')
    .action(async (opts: { page?: string; limit?: string; apiKey?: string }) => {
      const apiKey = await requireAuth(opts.apiKey);
      const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });
      const result = await client.getTransactions({
        page: parseOptionalInt(opts.page, '--page'),
        limit: parseOptionalInt(opts.limit, '--limit'),
      });
      printResult(result);
    });
}
