import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const saveCredential = vi.fn();
const loadCredential = vi.fn();
const resolveApiKeyWithPrompt = vi.fn();
const printStatus = vi.fn();
const exitWithError = vi.fn((msg: string) => {
  throw new Error(msg);
});
const validateKey = vi.fn();
const installSkillParseAsync = vi.fn();

class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number) {
    super(`API error ${statusCode}`);
    this.statusCode = statusCode;
  }
}

class DumplingAIClient {
  constructor(_opts: { apiKey: string; baseUrl: string }) {}

  validateKey = validateKey;
}

vi.mock('../../src/utils/auth.js', () => ({
  loadCredential,
  maskSecret: vi.fn(() => 'sk_test...'),
  saveCredential,
}));

vi.mock('../../src/utils/api-key.js', () => ({
  API_KEYS_URL: 'https://app.dumplingai.com/api-keys',
  getInvalidApiKeyMessage: vi.fn(
    () => 'API key is invalid. Check your key at https://app.dumplingai.com/api-keys',
  ),
  getMissingApiKeyMessage: vi.fn(
    () => 'Provide --api-key <key> or set DUMPLINGAI_API_KEY. Create one at https://app.dumplingai.com/api-keys',
  ),
  resolveApiKeyWithPrompt,
}));

vi.mock('../../src/utils/output.js', async () => {
  const actual = await vi.importActual<typeof import('../../src/utils/output.js')>(
    '../../src/utils/output.js',
  );
  return {
    ...actual,
    exitWithError,
    printStatus,
  };
});

vi.mock('../../src/client/api.js', () => ({
  ApiError,
  DumplingAIClient,
}));

vi.mock('../../src/utils/config.js', () => ({
  getApiUrl: vi.fn(() => 'https://app.dumplingai.com'),
}));

vi.mock('../../src/commands/setup-skill.js', () => ({
  makeSetupSkillCommand: vi.fn(() => ({
    commands: [
      {
        aliases: () => [],
        name: () => 'skill',
        parseAsync: installSkillParseAsync,
      },
    ],
  })),
}));

describe('auth commands', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prompts for an API key during login when none is provided', async () => {
    resolveApiKeyWithPrompt.mockResolvedValue('sk_prompted');
    validateKey.mockResolvedValue({ authenticated: true });

    const { makeLoginCommand } = await import('../../src/commands/login.js');
    await makeLoginCommand().parseAsync([], { from: 'user' });

    expect(resolveApiKeyWithPrompt).toHaveBeenCalledWith(undefined);
    expect(saveCredential).toHaveBeenCalledWith('sk_prompted');
    expect(printStatus).toHaveBeenCalledWith('Validating API key...');
    expect(printStatus).toHaveBeenCalledWith('Logged in successfully. Key: sk_test...');
  });

  it('fails login with the direct API keys URL when prompting is unavailable', async () => {
    resolveApiKeyWithPrompt.mockResolvedValue(undefined);

    const { makeLoginCommand } = await import('../../src/commands/login.js');

    await expect(makeLoginCommand().parseAsync([], { from: 'user' })).rejects.toThrow(
      'Provide --api-key <key> or set DUMPLINGAI_API_KEY. Create one at https://app.dumplingai.com/api-keys',
    );
    expect(exitWithError).toHaveBeenCalledWith(
      'Provide --api-key <key> or set DUMPLINGAI_API_KEY. Create one at https://app.dumplingai.com/api-keys',
    );
  });

  it('prompts for a replacement key during init when the stored key is invalid', async () => {
    loadCredential.mockResolvedValue('sk_stored');
    validateKey
      .mockResolvedValueOnce({ authenticated: false })
      .mockResolvedValueOnce({ authenticated: true });
    resolveApiKeyWithPrompt.mockResolvedValue('sk_replacement');

    const { makeInitCommand } = await import('../../src/commands/init.js');
    await makeInitCommand().parseAsync(['--skip-skill'], { from: 'user' });

    expect(printStatus).toHaveBeenCalledWith('Stored API key is invalid and must be replaced.');
    expect(resolveApiKeyWithPrompt).toHaveBeenCalledWith(undefined);
    expect(saveCredential).toHaveBeenCalledWith('sk_replacement');
    expect(installSkillParseAsync).not.toHaveBeenCalled();
  });

  it('reuses a valid stored key during init without prompting again', async () => {
    loadCredential.mockResolvedValue('sk_stored');
    validateKey.mockResolvedValue({ authenticated: true });

    const { makeInitCommand } = await import('../../src/commands/init.js');
    await makeInitCommand().parseAsync(['--skip-skill'], { from: 'user' });

    expect(resolveApiKeyWithPrompt).not.toHaveBeenCalled();
    expect(saveCredential).not.toHaveBeenCalled();
    expect(printStatus).toHaveBeenCalledWith('Already authenticated. Key: sk_test...');
  });
});
