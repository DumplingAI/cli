import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface Config {
  apiUrl?: string;
  telemetryEnabled?: boolean;
}

const DEFAULT_API_URL = 'https://app.dumplingai.com';

function getConfigDir(): string {
  switch (process.platform) {
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'dumplingai-cli');
    case 'win32':
      return path.join(process.env['APPDATA'] ?? os.homedir(), 'dumplingai-cli');
    default:
      return path.join(
        process.env['XDG_CONFIG_HOME'] ?? path.join(os.homedir(), '.config'),
        'dumplingai-cli',
      );
  }
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json');
}

export function getConfig(): Config {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return {};
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw) as Config;
  } catch {
    return {};
  }
}

export function setConfig(updates: Partial<Config>): void {
  const configPath = getConfigPath();
  const dir = path.dirname(configPath);
  fs.mkdirSync(dir, { recursive: true });
  const current = getConfig();
  const merged = { ...current, ...updates };
  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
}

export function getApiUrl(flags?: { apiUrl?: string }): string {
  return (
    flags?.apiUrl ??
    process.env['DUMPLINGAI_API_URL'] ??
    getConfig().apiUrl ??
    DEFAULT_API_URL
  );
}

export interface EffectiveConfig {
  apiKey: string | undefined;
  apiUrl: string;
  apiKeySource: 'flag' | 'env' | 'stored' | undefined;
}

export function getEffectiveConfig(flags?: {
  apiKey?: string;
  apiUrl?: string;
}): EffectiveConfig {
  const apiUrl = getApiUrl(flags);
  let apiKey: string | undefined;
  let apiKeySource: EffectiveConfig['apiKeySource'];

  if (flags?.apiKey) {
    apiKey = flags.apiKey;
    apiKeySource = 'flag';
  } else if (process.env['DUMPLINGAI_API_KEY']) {
    apiKey = process.env['DUMPLINGAI_API_KEY'];
    apiKeySource = 'env';
  }

  return { apiKey, apiUrl, apiKeySource };
}
