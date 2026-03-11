import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DumplingAIClient } from '../../src/client/api.js';
import { makeCatalogCommand } from '../../src/commands/catalog.js';
import { makeRunCommand } from '../../src/commands/run.js';

describe('command parsing', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumplingai-command-'));
    vi.stubEnv('DUMPLINGAI_API_KEY', 'sk_test');
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('parses catalog search options', async () => {
    const searchCatalogSpy = vi
      .spyOn(DumplingAIClient.prototype, 'searchCatalog')
      .mockResolvedValue({ items: [] });

    await makeCatalogCommand().parseAsync(
      ['search', 'google search', '--type', 'capability', '--limit', '5'],
      { from: 'user' },
    );

    expect(searchCatalogSpy).toHaveBeenCalledWith('google search', {
      type: 'capability',
      limit: 5,
    });
  });

  it('prints a retry hint when catalog search returns no results', async () => {
    vi.spyOn(DumplingAIClient.prototype, 'searchCatalog').mockResolvedValue({ items: [] });
    const stderrWrite = vi.spyOn(process.stderr, 'write');

    await makeCatalogCommand().parseAsync(['search', 'google search capability'], {
      from: 'user',
    });

    expect(stderrWrite).toHaveBeenCalledWith(
      expect.stringContaining('No catalog results found. Retry with a shorter keyword query'),
    );
  });

  it('does not print the no-results hint when catalog search returns results', async () => {
    vi.spyOn(DumplingAIClient.prototype, 'searchCatalog').mockResolvedValue({
      items: [{ id: 'google_search' }],
    });
    const stderrWrite = vi.spyOn(process.stderr, 'write');

    await makeCatalogCommand().parseAsync(['search', 'google search'], {
      from: 'user',
    });

    expect(stderrWrite).not.toHaveBeenCalledWith(
      expect.stringContaining('No catalog results found. Retry with a shorter keyword query'),
    );
  });

  it('parses catalog details arguments', async () => {
    const detailsSpy = vi
      .spyOn(DumplingAIClient.prototype, 'getCatalogDetails')
      .mockResolvedValue({ id: 'firecrawl.scrape' });

    await makeCatalogCommand().parseAsync(['details', 'endpoint', 'firecrawl.scrape'], {
      from: 'user',
    });

    expect(detailsSpy).toHaveBeenCalledWith('endpoint', 'firecrawl.scrape');
  });

  it('passes inline JSON input to the client', async () => {
    const runSpy = vi.spyOn(DumplingAIClient.prototype, 'run').mockResolvedValue({ ok: true });

    await makeRunCommand().parseAsync(
      [
        'capability',
        'google_search',
        '--input',
        '{"query":"latest TypeScript release"}',
        '--provider',
        'serper',
        '--include-native',
      ],
      { from: 'user' },
    );

    expect(runSpy).toHaveBeenCalledWith('capability', 'google_search', {
      input: { query: 'latest TypeScript release' },
      provider: 'serper',
      includeNative: true,
    });
  });

  it('passes file-based JSON input to the client', async () => {
    const inputFile = path.join(tmpDir, 'payload.json');
    fs.writeFileSync(inputFile, '{"url":"https://example.com"}', 'utf8');

    const runSpy = vi.spyOn(DumplingAIClient.prototype, 'run').mockResolvedValue({ ok: true });

    await makeRunCommand().parseAsync(
      ['endpoint', 'firecrawl.scrape', '--input-file', inputFile],
      { from: 'user' },
    );

    expect(runSpy).toHaveBeenCalledWith('endpoint', 'firecrawl.scrape', {
      input: { url: 'https://example.com' },
      provider: undefined,
      includeNative: undefined,
    });
  });
});
