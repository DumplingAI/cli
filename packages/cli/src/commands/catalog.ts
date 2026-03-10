import { Command } from 'commander';

import { DumplingAIClient } from '../client/api.js';
import type { CatalogObjectType } from '../client/api.js';
import { requireAuth } from '../utils/auth.js';
import { getApiUrl } from '../utils/config.js';
import { exitWithError, printResult } from '../utils/output.js';

const CATALOG_TYPES: CatalogObjectType[] = ['capability', 'provider', 'endpoint'];

function getClient(apiKey?: string): Promise<DumplingAIClient> {
  return requireAuth(apiKey).then((resolvedApiKey) =>
    new DumplingAIClient({ apiKey: resolvedApiKey, baseUrl: getApiUrl() }),
  );
}

function parseCatalogType(value?: string): CatalogObjectType | undefined {
  if (!value) return undefined;
  if (CATALOG_TYPES.includes(value as CatalogObjectType)) {
    return value as CatalogObjectType;
  }
  exitWithError(`Invalid type "${value}". Valid: ${CATALOG_TYPES.join(', ')}`);
}

function parseOptionalInt(value?: string, flagName?: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    exitWithError(`Invalid ${flagName}. Expected a positive integer.`);
  }
  return parsed;
}

export function makeCatalogCommand(): Command {
  const command = new Command('catalog')
    .description('Search and inspect the DumplingAI v2 catalog');

  command.addCommand(
    new Command('search')
      .description('Search capabilities, providers, and endpoints')
      .argument('<prompt>', 'Prompt describing the API need')
      .option('--type <type>', 'Filter to capability, provider, or endpoint')
      .option('--limit <n>', 'Maximum number of results to return')
      .option('--api-key <key>', 'Override API key for this request')
      .action(async (prompt: string, opts: { type?: string; limit?: string; apiKey?: string }) => {
        const client = await getClient(opts.apiKey);
        const result = await client.searchCatalog(prompt, {
          type: parseCatalogType(opts.type),
          limit: parseOptionalInt(opts.limit, '--limit'),
        });
        printResult(result);
      }),
  );

  command.addCommand(
    new Command('details')
      .description('Get full details for a capability, provider, or endpoint')
      .argument('<type>', 'Catalog type: capability, provider, or endpoint')
      .argument('<id>', 'Catalog object id')
      .option('--api-key <key>', 'Override API key for this request')
      .action(async (type: string, id: string, opts: { apiKey?: string }) => {
        const client = await getClient(opts.apiKey);
        const result = await client.getCatalogDetails(parseCatalogType(type) as CatalogObjectType, id);
        printResult(result);
      }),
  );

  return command;
}
