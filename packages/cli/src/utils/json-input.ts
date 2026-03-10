import fs from 'node:fs';

import { exitWithError } from './output.js';

export function readJsonObjectInput(opts: {
  input?: string;
  inputFile?: string;
}): Record<string, unknown> {
  if (opts.input && opts.inputFile) {
    exitWithError('Provide either `--input` or `--input-file`, not both.');
  }

  if (!opts.input && !opts.inputFile) {
    exitWithError('Missing run input. Provide `--input` or `--input-file`.');
  }

  const raw = opts.input ?? readInputFile(opts.inputFile as string);
  return parseJsonObject(raw);
}

export function parseJsonObject(raw: string): Record<string, unknown> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    exitWithError(`Invalid JSON input: ${(err as Error).message}`);
  }

  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    exitWithError('Run input must be a JSON object.');
  }

  return parsed as Record<string, unknown>;
}

function readInputFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    exitWithError(`Failed to read input file: ${(err as Error).message}`);
  }
}
