import { Command } from 'commander';
import { loadCredential, saveCredential, maskSecret } from '../utils/auth.js';
import { DumplingAIClient, ApiError } from '../client/api.js';
import { getApiUrl } from '../utils/config.js';
import { printStatus, exitWithError } from '../utils/output.js';
import { makeSetupSkillCommand } from './setup-skill.js';
import {
  getInvalidApiKeyMessage,
  getMissingApiKeyMessage,
  resolveApiKeyWithPrompt,
} from '../utils/api-key.js';

export function makeInitCommand(): Command {
  return new Command('init')
    .description('Initialize the v2 CLI: authenticate and optionally set up agent skills')
    .option('--api-key <key>', 'API key (otherwise prompt, or set DUMPLINGAI_API_KEY)')
    .option('--skip-skill', 'Skip agent skill installation')
    .action(async (opts: { apiKey?: string; skipSkill?: boolean }) => {
      const apiUrl = getApiUrl();
      const providedApiKey = opts.apiKey ?? process.env['DUMPLINGAI_API_KEY'];

      // 1. Check and validate existing credentials when no override is provided
      const existingKey = await loadCredential();
      if (existingKey && !providedApiKey) {
        printStatus('Validating stored API key...');
        const existingClient = new DumplingAIClient({ apiKey: existingKey, baseUrl: apiUrl });
        try {
          const existingStatus = await existingClient.validateKey();
          if (existingStatus.authenticated) {
            printStatus(`Already authenticated. Key: ${maskSecret(existingKey)}`);
            printStatus('Run `dumplingai logout` to clear credentials.');
            if (!opts.skipSkill) {
              printStatus('\nSetting up agent skills...');
              await runSkillSetup();
            }
            return;
          }
          printStatus('Stored API key is invalid and must be replaced.');
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 401) {
            printStatus('Stored API key is invalid and must be replaced.');
          } else {
            printStatus('Warning: could not validate stored key (network issue). Continuing with existing credentials.');
            printStatus(`Using stored key: ${maskSecret(existingKey)}`);
            if (!opts.skipSkill) {
              printStatus('\nSetting up agent skills...');
              await runSkillSetup();
            }
            return;
          }
        }
      }

      // 2. Get API key
      const apiKey = await resolveApiKeyWithPrompt(providedApiKey);
      if (!apiKey) {
        exitWithError(getMissingApiKeyMessage());
      }

      // 3. Validate key
      printStatus('Validating API key...');
      const client = new DumplingAIClient({ apiKey, baseUrl: apiUrl });
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

      // 4. Save credential
      await saveCredential(apiKey);
      printStatus(`Authentication successful. Key: ${maskSecret(apiKey)}`);

      // 5. Optionally set up skills
      if (!opts.skipSkill) {
        printStatus('\nSetting up agent skills...');
        await runSkillSetup();
      }

      printStatus('\nDone! Try: dumplingai catalog search "google search"');
    });
}

async function runSkillSetup(): Promise<void> {
  const skillCmd = makeSetupSkillCommand();
  // Find the install subcommand and call its action
  const installSub = skillCmd.commands.find(
    (c) => c.name() === 'skill' || c.aliases().includes('install'),
  );
  if (installSub) {
    await installSub.parseAsync([], { from: 'user' });
  }
}
