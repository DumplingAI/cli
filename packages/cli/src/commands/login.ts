import { Command } from 'commander';
import { saveCredential, maskSecret } from '../utils/auth.js';
import { DumplingAIClient, ApiError } from '../client/api.js';
import { getApiUrl } from '../utils/config.js';
import { exitWithError, printStatus } from '../utils/output.js';
import {
  getInvalidApiKeyMessage,
  getMissingApiKeyMessage,
  resolveApiKeyWithPrompt,
} from '../utils/api-key.js';

export function makeLoginCommand(): Command {
  return new Command('login')
    .description('Authenticate with your DumplingAI API key for the Unified API Platform')
    .option('--api-key <key>', 'API key to save (otherwise prompt, or set DUMPLINGAI_API_KEY)')
    .action(async (opts: { apiKey?: string }) => {
      const apiKey = await resolveApiKeyWithPrompt(
        opts.apiKey ?? process.env['DUMPLINGAI_API_KEY'],
      );
      if (!apiKey) {
        exitWithError(getMissingApiKeyMessage());
      }

      printStatus('Validating API key...');
      const client = new DumplingAIClient({ apiKey, baseUrl: getApiUrl() });

      try {
        const result = await client.validateKey();
        if (!result.authenticated) {
          exitWithError(getInvalidApiKeyMessage());
        }
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
          exitWithError(getInvalidApiKeyMessage());
        }
        printStatus('Warning: could not validate key against /api/v2/balance. Saving anyway.');
      }

      await saveCredential(apiKey);
      printStatus(`Logged in successfully. Key: ${maskSecret(apiKey)}`);
    });
}
