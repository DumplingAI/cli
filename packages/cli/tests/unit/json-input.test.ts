import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseJsonObject, readJsonObjectInput } from '../../src/utils/json-input.js';

describe('json input', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumplingai-json-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('parses inline JSON objects', () => {
    expect(parseJsonObject('{"query":"hello"}')).toEqual({ query: 'hello' });
  });

  it('reads JSON objects from files', () => {
    const inputFile = path.join(tmpDir, 'payload.json');
    fs.writeFileSync(inputFile, '{"url":"https://example.com"}', 'utf8');

    expect(readJsonObjectInput({ inputFile })).toEqual({
      url: 'https://example.com',
    });
  });
});
