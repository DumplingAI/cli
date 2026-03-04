import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mockFailingKeytar() {
  const error = new Error('keychain unavailable');
  vi.doMock('keytar', () => ({
    default: {
      setPassword: vi.fn().mockRejectedValue(error),
      getPassword: vi.fn().mockRejectedValue(error),
      deletePassword: vi.fn().mockRejectedValue(error),
    },
  }));
}

describe('auth keytar fallback', () => {
  let tmpHome: string;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'dumplingai-auth-'));
    vi.stubEnv('HOME', tmpHome);
  });

  afterEach(() => {
    vi.unmock('keytar');
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it('saveCredential falls back to credentials file when keytar write fails', async () => {
    vi.resetModules();
    mockFailingKeytar();
    const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const { saveCredential, getCredentialsFilePath } = await import('../../src/utils/auth.js');

    await saveCredential('sk_saved');

    const credPath = getCredentialsFilePath();
    expect(fs.existsSync(credPath)).toBe(true);
    expect(JSON.parse(fs.readFileSync(credPath, 'utf8'))).toEqual({ apiKey: 'sk_saved' });
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('loadCredential falls back to credentials file when keytar read fails', async () => {
    vi.resetModules();
    mockFailingKeytar();
    const { loadCredential, getCredentialsFilePath } = await import('../../src/utils/auth.js');

    const credPath = getCredentialsFilePath();
    fs.mkdirSync(path.dirname(credPath), { recursive: true });
    fs.writeFileSync(credPath, JSON.stringify({ apiKey: 'sk_from_file' }), 'utf8');

    await expect(loadCredential()).resolves.toBe('sk_from_file');
  });

  it('deleteCredential removes file even when keytar delete fails', async () => {
    vi.resetModules();
    mockFailingKeytar();
    const { deleteCredential, getCredentialsFilePath } = await import('../../src/utils/auth.js');

    const credPath = getCredentialsFilePath();
    fs.mkdirSync(path.dirname(credPath), { recursive: true });
    fs.writeFileSync(credPath, JSON.stringify({ apiKey: 'sk_to_delete' }), 'utf8');

    await deleteCredential();

    expect(fs.existsSync(credPath)).toBe(false);
  });
});
