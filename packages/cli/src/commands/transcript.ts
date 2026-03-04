import { Command } from 'commander';
import { requireAuth } from '../utils/auth.js';
import { DumplingAIClient, TranscriptResult } from '../client/api.js';
import { getApiUrl } from '../utils/config.js';
import { printResult, exitWithError } from '../utils/output.js';

function formatTranscript(result: TranscriptResult): string {
  if (!result.transcript) return JSON.stringify(result, null, 2);

  if (typeof result.transcript === 'string') return result.transcript;

  if (Array.isArray(result.transcript)) {
    return result.transcript.map((seg) => seg.text).join('\n');
  }

  return JSON.stringify(result, null, 2);
}

export function makeTranscriptCommand(): Command {
  return new Command('transcript')
    .description('Get transcript from a YouTube or TikTok video URL')
    .argument('<url>', 'YouTube or TikTok video URL')
    .option('--lang <code>', 'Preferred language code (default: en)', 'en')
    .option('--timestamps', 'Include timestamps in output')
    .option('--chunk-size <n>', 'Number of segments to merge')
    .option('--json', 'Output raw JSON response')
    .option('-o, --output <file>', 'Write output to file instead of stdout')
    .option('--api-key <key>', 'Override API key for this request')
    .action(
      async (
        url: string,
        opts: {
          lang?: string;
          timestamps?: boolean;
          chunkSize?: string;
          json?: boolean;
          output?: string;
          apiKey?: string;
        },
      ) => {
        const apiKey = await requireAuth(opts.apiKey);
        const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });

        try {
          const result = await client.transcript(url, {
            preferredLanguage: opts.lang,
            includeTimestamps: opts.timestamps,
            chunkSize: opts.chunkSize ? parseInt(opts.chunkSize, 10) : undefined,
          });

          if (opts.json || opts.output?.endsWith('.json')) {
            printResult(result, { json: true, output: opts.output });
          } else {
            const text = formatTranscript(result);
            printResult(text, { output: opts.output });
          }
        } catch (err) {
          exitWithError((err as Error).message);
        }
      },
    );
}
