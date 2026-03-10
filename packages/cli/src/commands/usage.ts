import { Command } from 'commander';

import { DumplingAIClient } from '../client/api.js';
import type { CatalogObjectType } from '../client/api.js';
import { requireAuth } from '../utils/auth.js';
import { getApiUrl } from '../utils/config.js';
import { exitWithError, printResult } from '../utils/output.js';

const OBJECT_TYPES: CatalogObjectType[] = ['capability', 'provider', 'endpoint'];

function parseObjectType(value?: string): CatalogObjectType | undefined {
  if (!value) return undefined;
  if (OBJECT_TYPES.includes(value as CatalogObjectType)) {
    return value as CatalogObjectType;
  }
  exitWithError(`Invalid --object-type "${value}". Valid: ${OBJECT_TYPES.join(', ')}`);
}

function parseOptionalInt(value?: string, flagName?: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    exitWithError(`Invalid ${flagName}. Expected a positive integer.`);
  }
  return parsed;
}

export function makeUsageCommand(): Command {
  return new Command('usage')
    .description('Get usage and request logs for the authenticated API key')
    .option('--object-type <type>', 'Filter by capability, provider, or endpoint')
    .option('--status <status>', 'Filter by request status')
    .option('--provider <provider>', 'Filter by provider')
    .option('--object-id <id>', 'Filter by capability or endpoint id')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Page size')
    .option('--api-key <key>', 'Override API key for this request')
    .action(
      async (opts: {
        objectType?: string;
        status?: string;
        provider?: string;
        objectId?: string;
        page?: string;
        limit?: string;
        apiKey?: string;
      }) => {
        const apiKey = await requireAuth(opts.apiKey);
        const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });
        const result = await client.getUsage({
          objectType: parseObjectType(opts.objectType),
          status: opts.status,
          provider: opts.provider,
          objectId: opts.objectId,
          page: parseOptionalInt(opts.page, '--page'),
          limit: parseOptionalInt(opts.limit, '--limit'),
        });
        printResult(result);
      },
    );
}
