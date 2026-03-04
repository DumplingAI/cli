import { Command } from 'commander';
import { requireAuth } from '../utils/auth.js';
import { DumplingAIClient } from '../client/api.js';
import { getApiUrl } from '../utils/config.js';
import { printResult, exitWithError } from '../utils/output.js';

export function makeScrapeCommand(): Command {
  return new Command('scrape')
    .description('Scrape a URL and return structured content')
    .argument('<url>', 'URL to scrape')
    .option('--format <fmt>', 'Output format: markdown, html, screenshot', 'markdown')
    .option('--no-cleaned', 'Disable content cleaning/simplification')
    .option('--no-render-js', 'Disable JavaScript rendering')
    .option('--json', 'Output raw JSON response')
    .option('-o, --output <file>', 'Write output to file instead of stdout')
    .option('--api-key <key>', 'Override API key for this request')
    .action(
      async (
        url: string,
        opts: {
          format?: string;
          cleaned?: boolean;
          renderJs?: boolean;
          json?: boolean;
          output?: string;
          apiKey?: string;
        },
      ) => {
        const validFormats = ['markdown', 'html', 'screenshot'];
        if (opts.format && !validFormats.includes(opts.format)) {
          exitWithError(`Invalid format "${opts.format}". Valid: ${validFormats.join(', ')}`);
        }

        const apiKey = await requireAuth(opts.apiKey);
        const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });

        try {
          const result = await client.scrape(url, {
            format: opts.format as 'markdown' | 'html' | 'screenshot' | undefined,
            cleaned: opts.cleaned !== false,
            renderJs: opts.renderJs !== false,
          });

          if (opts.json || opts.output?.endsWith('.json')) {
            printResult(result, { json: true, output: opts.output });
          } else {
            // Print content or full result
            const content = result.content ?? JSON.stringify(result, null, 2);
            printResult(content, { output: opts.output });
          }
        } catch (err) {
          exitWithError((err as Error).message);
        }
      },
    );
}
