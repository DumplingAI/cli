import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { loadCredential } from '../utils/auth.js';
import { exitWithError, printStatus } from '../utils/output.js';
import { API_KEYS_URL } from '../utils/api-key.js';

const ENV_KEY_NAME = 'DUMPLINGAI_API_KEY';

export function makeEnvPullCommand(): Command {
  return new Command('env')
    .description('Manage environment variables')
    .addCommand(
      new Command('pull')
        .description(`Write ${ENV_KEY_NAME} to a .env file`)
        .option('-f, --file <path>', 'Target .env file path', '.env')
        .action(async (opts: { file: string }) => {
          const apiKey = await loadCredential();
          if (!apiKey) {
            exitWithError(
              `No stored credentials found. Run \`dumplingai login\` first. Create a key at ${API_KEYS_URL}`,
            );
          }

          const filePath = path.resolve(opts.file);
          const line = `${ENV_KEY_NAME}=${apiKey}`;

          if (fs.existsSync(filePath)) {
            const existing = fs.readFileSync(filePath, 'utf8');
            const lines = existing.split('\n');
            const keyIdx = lines.findIndex((l) => l.startsWith(`${ENV_KEY_NAME}=`));

            if (keyIdx >= 0) {
              printStatus(`Warning: ${ENV_KEY_NAME} already exists in ${filePath}. Updating.`);
              lines[keyIdx] = line;
              fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            } else {
              const content = existing.endsWith('\n') ? existing + line + '\n' : existing + '\n' + line + '\n';
              fs.writeFileSync(filePath, content, 'utf8');
            }
          } else {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, line + '\n', 'utf8');
          }

          printStatus(`${ENV_KEY_NAME} written to ${filePath}`);
        }),
    );
}
