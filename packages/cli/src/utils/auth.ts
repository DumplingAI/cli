import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { API_KEYS_URL } from './api-key.js';
import { getConfigPath } from './config.js';

function getCredentialsFilePath(): string {
  return path.join(path.dirname(getConfigPath()), 'credentials.json');
}

interface StoredCredentials {
  apiKey?: string;
}

export async function saveCredential(apiKey: string): Promise<void> {
  const credPath = getCredentialsFilePath();
  fs.mkdirSync(path.dirname(credPath), { recursive: true });
  const creds: StoredCredentials = { apiKey };
  fs.writeFileSync(credPath, JSON.stringify(creds, null, 2), { encoding: 'utf8', mode: 0o600 });
}

export async function loadCredential(): Promise<string | undefined> {
  const credPath = getCredentialsFilePath();
  if (!fs.existsSync(credPath)) return undefined;
  try {
    const raw = fs.readFileSync(credPath, 'utf8');
    const creds = JSON.parse(raw) as StoredCredentials;
    return creds.apiKey;
  } catch {
    return undefined;
  }
}

export async function deleteCredential(): Promise<void> {
  const credPath = getCredentialsFilePath();
  if (fs.existsSync(credPath)) {
    fs.unlinkSync(credPath);
  }
}

export async function requireAuth(existingApiKey?: string): Promise<string> {
  const apiKey = existingApiKey ?? process.env['DUMPLINGAI_API_KEY'] ?? (await loadCredential());

  if (!apiKey) {
    process.stderr.write(
      'Error: No API key found.\n' +
        'Run `dumplingai login` or set DUMPLINGAI_API_KEY env var.\n' +
        `Create a key at ${API_KEYS_URL}\n`,
    );
    process.exit(1);
  }

  return apiKey;
}

export function maskSecret(key: string): string {
  if (key.length <= 8) return '***';
  return key.slice(0, 8) + '...';
}

export function getConfigDir(): string {
  return path.dirname(getConfigPath());
}

export function getCredentialSource(apiKey: string | undefined): string {
  if (!apiKey) return 'none';
  if (process.env['DUMPLINGAI_API_KEY'] === apiKey) return 'env (DUMPLINGAI_API_KEY)';
  const credPath = getCredentialsFilePath();
  if (fs.existsSync(credPath)) return 'credentials file';
  return 'none';
}

export { getCredentialsFilePath };

// Re-export homedir for convenience in tests
export { os };
export const homeDir = os.homedir();
