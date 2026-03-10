import { Command } from 'commander';

import { DumplingAIClient } from '../client/api.js';
import type { RunObjectType } from '../client/api.js';
import { requireAuth } from '../utils/auth.js';
import { getApiUrl } from '../utils/config.js';
import { readJsonObjectInput } from '../utils/json-input.js';
import { exitWithError, printResult } from '../utils/output.js';

const RUN_TYPES: RunObjectType[] = ['capability', 'endpoint'];

function parseRunType(value: string): RunObjectType {
  if (RUN_TYPES.includes(value as RunObjectType)) {
    return value as RunObjectType;
  }
  exitWithError(`Invalid type "${value}". Valid: ${RUN_TYPES.join(', ')}`);
}

export function makeRunCommand(): Command {
  return new Command('run')
    .description('Execute a capability or provider endpoint through DumplingAI v2')
    .argument('<type>', 'Run type: capability or endpoint')
    .argument('<id>', 'Capability id or endpoint id')
    .option('--input <json>', 'Inline JSON object input')
    .option('--input-file <path>', 'Path to a JSON file containing the input object')
    .option('--provider <provider>', 'Optional provider override for capability runs')
    .option('--include-native', 'Include provider-native output in the response when available')
    .option('--api-key <key>', 'Override API key for this request')
    .action(
      async (
        type: string,
        id: string,
        opts: {
          input?: string;
          inputFile?: string;
          provider?: string;
          includeNative?: boolean;
          apiKey?: string;
        },
      ) => {
        const runType = parseRunType(type);
        if (runType === 'endpoint' && opts.provider) {
          exitWithError('`--provider` is only valid for capability runs.');
        }

        const apiKey = await requireAuth(opts.apiKey);
        const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });
        const result = await client.run(runType, id, {
          input: readJsonObjectInput({
            input: opts.input,
            inputFile: opts.inputFile,
          }),
          provider: opts.provider,
          includeNative: opts.includeNative,
        });

        printResult(result);
      },
    );
}
