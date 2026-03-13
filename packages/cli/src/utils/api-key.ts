import { printStatus } from './output.js';

export const API_KEYS_URL = 'https://app.dumplingai.com/api-keys';

export function getApiKeysPageMessage(): string {
  return `Open the API keys page to create one: ${API_KEYS_URL}`;
}

export function getMissingApiKeyMessage(): string {
  return `Provide --api-key <key> or set DUMPLINGAI_API_KEY. Create one at ${API_KEYS_URL}`;
}

export function getInvalidApiKeyMessage(): string {
  return `API key is invalid. Check your key at ${API_KEYS_URL}`;
}

export async function resolveApiKeyWithPrompt(apiKey?: string): Promise<string | undefined> {
  if (apiKey) {
    return apiKey;
  }

  if (!canPromptForSecret()) {
    return undefined;
  }

  printStatus(getApiKeysPageMessage());
  const enteredApiKey = await promptForSecret('Paste your DumplingAI API key: ');
  return enteredApiKey.trim() || undefined;
}

function canPromptForSecret(): boolean {
  return Boolean(process.stdin.isTTY && process.stderr.isTTY && process.stdin.setRawMode);
}

async function promptForSecret(prompt: string): Promise<string> {
  return await new Promise<string>((resolve) => {
    const stdin = process.stdin;
    const stderr = process.stderr;
    const wasRaw = stdin.isRaw;
    let value = '';

    const cleanup = () => {
      stdin.off('data', onData);
      stdin.pause();
      stdin.setRawMode?.(Boolean(wasRaw));
    };

    const onData = (chunk: Buffer | string) => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\u0003') {
          stderr.write('\n');
          cleanup();
          process.exit(130);
          return;
        }

        if (char === '\r' || char === '\n') {
          stderr.write('\n');
          cleanup();
          resolve(value);
          return;
        }

        if (char === '\u0008' || char === '\u007f') {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stderr.write('\b \b');
          }
          continue;
        }

        if (char >= ' ' && char !== '\u007f') {
          value += char;
          stderr.write(char);
        }
      }
    };

    stderr.write(prompt);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}
