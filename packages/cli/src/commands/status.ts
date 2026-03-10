import { Command } from 'commander';
import { loadCredential, maskSecret } from '../utils/auth.js';
import { DumplingAIClient, ApiError } from '../client/api.js';
import { getApiUrl } from '../utils/config.js';
import { printResult } from '../utils/output.js';
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

export function makeStatusCommand(): Command {
  return new Command('status')
    .description('Show CLI version, authentication status, and v2 balance context')
    .action(async () => {
      const version = getCliVersion();
      const apiUrl = getApiUrl();
      const storedKey = await loadCredential();
      const envKey = process.env['DUMPLINGAI_API_KEY'];
      const apiKey = envKey ?? storedKey;

      let authSource: string;
      if (envKey) {
        authSource = 'env (DUMPLINGAI_API_KEY)';
      } else if (storedKey) {
        authSource = 'credential store';
      } else {
        authSource = 'none';
      }

      const status: Record<string, unknown> = {
        version,
        apiUrl,
        authenticated: !!apiKey,
        authSource,
      };

      if (apiKey) {
        status['maskedKey'] = maskSecret(apiKey);
        const client = new DumplingAIClient({ apiKey, baseUrl: apiUrl });
        try {
          status['balance'] = await client.getBalance();
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 401) {
            status['authenticated'] = false;
            status['authError'] = 'API key is invalid';
          } else {
            status['authError'] = (err as Error).message;
          }
        }
      }

      printResult(status);
    });
}
