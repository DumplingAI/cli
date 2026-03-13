import { Command } from 'commander';
import { loadCredential, maskSecret } from '../utils/auth.js';
import { getConfig, getConfigPath, getApiUrl } from '../utils/config.js';
import { printResult } from '../utils/output.js';

export function makeViewConfigCommand(): Command {
  return new Command('view-config')
    .description('Display current CLI configuration (read-only)')
    .action(async () => {
      const configPath = getConfigPath();
      const storedConfig = getConfig();
      const apiUrl = getApiUrl();
      const storedKey = await loadCredential();
      const envKey = process.env['DUMPLINGAI_API_KEY'];
      const apiKey = envKey ?? storedKey;

      let apiKeySource: string;
      if (envKey) {
        apiKeySource = 'env (DUMPLINGAI_API_KEY)';
      } else if (storedKey) {
        apiKeySource = 'credentials file';
      } else {
        apiKeySource = 'none';
      }

      const config = {
        configPath,
        apiUrl,
        apiKeySource,
        maskedApiKey: apiKey ? maskSecret(apiKey) : undefined,
        storedConfig,
      };

      printResult(config);
    });
}
