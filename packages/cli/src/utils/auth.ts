import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getConfigPath } from './config.js';

const SERVICE_NAME = 'dumplingai-cli';
const ACCOUNT_NAME = 'api-key';

function getCredentialsFilePath(): string {
  return path.join(path.dirname(getConfigPath()), 'credentials.json');
}

interface StoredCredentials {
  apiKey?: string;
}

interface Keytar {
  setPassword(service: string, account: string, password: string): Promise<void>;
  getPassword(service: string, account: string): Promise<string | null>;
  deletePassword(service: string, account: string): Promise<boolean>;
}

async function tryKeytar(): Promise<Keytar | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import('keytar' as any) as any;
    return (mod.default ?? mod) as Keytar;
  } catch {
    return null;
  }
}

export async function saveCredential(apiKey: string): Promise<void> {
  const keytar = await tryKeytar();
  if (keytar) {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey);
      return;
    } catch (err) {
      process.stderr.write(
        'Warning: system keychain write failed; falling back to plaintext credentials file. ' +
          `${(err as Error).message}\n`,
      );
    }
  }

  // Fallback: credentials.json with 600 permissions
  const credPath = getCredentialsFilePath();
  fs.mkdirSync(path.dirname(credPath), { recursive: true });
  const creds: StoredCredentials = { apiKey };
  fs.writeFileSync(credPath, JSON.stringify(creds, null, 2), { encoding: 'utf8', mode: 0o600 });

  process.stderr.write(
    'Warning: system keychain unavailable; credentials stored in plaintext at ' + credPath + '\n',
  );
}

export async function loadCredential(): Promise<string | undefined> {
  const keytar = await tryKeytar();
  if (keytar) {
    try {
      const val = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      if (val) return val;
    } catch (err) {
      process.stderr.write(
        'Warning: system keychain read failed; falling back to plaintext credentials file. ' +
          `${(err as Error).message}\n`,
      );
    }
  }

  // Fallback: credentials.json
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
  const keytar = await tryKeytar();
  if (keytar) {
    try {
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (err) {
      process.stderr.write(
        'Warning: system keychain delete failed; continuing cleanup with plaintext credentials file. ' +
          `${(err as Error).message}\n`,
      );
    }
  }

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
        'Run `dumplingai login --api-key <key>` or set DUMPLINGAI_API_KEY env var.\n',
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
  return 'system keychain';
}

export { getCredentialsFilePath };

// Re-export homedir for convenience in tests
export { os };
export const homeDir = os.homedir();
