import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('auth storage', () => {
  let tmpHome: string;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'dumplingai-auth-'));
    vi.stubEnv('HOME', tmpHome);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it('saveCredential writes the credentials file', async () => {
    const { saveCredential, getCredentialsFilePath } = await import('../../src/utils/auth.js');

    await saveCredential('sk_saved');

    const credPath = getCredentialsFilePath();
    expect(fs.existsSync(credPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(credPath, 'utf8'))).toEqual({ apiKey: 'sk_saved' });
  });

  it('loadCredential reads the credentials file', async () => {
    const { loadCredential, getCredentialsFilePath } = await import('../../src/utils/auth.js');

    const credPath = getCredentialsFilePath();
    fs.mkdirSync(path.dirname(credPath), { recursive: true });
    fs.writeFileSync(credPath, JSON.stringify({ apiKey: 'sk_from_file' }), 'utf8');

    await expect(loadCredential()).resolves.toBe('sk_from_file');
  });

  it('deleteCredential removes the credentials file', async () => {
    const { deleteCredential, getCredentialsFilePath } = await import('../../src/utils/auth.js');

    const credPath = getCredentialsFilePath();
    fs.mkdirSync(path.dirname(credPath), { recursive: true });
    fs.writeFileSync(credPath, JSON.stringify({ apiKey: 'sk_to_delete' }), 'utf8');

    await deleteCredential();

    expect(fs.existsSync(credPath)).toBe(false);
  });
});
