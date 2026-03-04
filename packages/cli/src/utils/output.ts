import fs from 'node:fs';
import path from 'node:path';

export interface PrintOptions {
  json?: boolean;
  output?: string;
}

export function printResult(data: unknown, opts: PrintOptions = {}): void {
  const text = opts.json ? JSON.stringify(data, null, 2) : formatValue(data);

  if (opts.output) {
    writeFile(opts.output, text);
  } else {
    process.stdout.write(text + '\n');
  }
}

function formatValue(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data === null || data === undefined) return '';
  return JSON.stringify(data, null, 2);
}

export function printStatus(msg: string): void {
  process.stderr.write(msg + '\n');
}

export function printError(msg: string): void {
  process.stderr.write('Error: ' + msg + '\n');
}

export function exitWithError(msg: string, code = 1): never {
  printError(msg);
  process.exit(code);
}

export function writeFile(filePath: string, content: string): void {
  const absPath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, 'utf8');
  process.stderr.write('Output written to: ' + absPath + '\n');
}

export function maskSecret(key: string): string {
  if (key.length <= 8) return '***';
  return key.slice(0, 8) + '...';
}
