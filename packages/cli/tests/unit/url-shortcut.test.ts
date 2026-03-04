import { describe, it, expect } from 'vitest';
import {
  getFirstSearchPositionalArg,
  isKnownSubcommand,
  isKnownSearchSubcommand,
} from '../../src/utils/argv-shortcuts.js';

// Test the URL-shortcut detection logic in isolation
function isUrlShortcut(arg: string): boolean {
  if (!arg) return false;
  return (arg.startsWith('http://') || arg.startsWith('https://')) &&
    !isKnownSubcommand(arg);
}

describe('URL shortcut detection', () => {
  it('detects http:// URLs', () => {
    expect(isUrlShortcut('http://example.com')).toBe(true);
  });

  it('detects https:// URLs', () => {
    expect(isUrlShortcut('https://example.com/path?q=1')).toBe(true);
  });

  it('does not match known subcommands', () => {
    expect(isUrlShortcut('scrape')).toBe(false);
    expect(isUrlShortcut('search')).toBe(false);
    expect(isUrlShortcut('init')).toBe(false);
  });

  it('does not match plain strings', () => {
    expect(isUrlShortcut('hello')).toBe(false);
    expect(isUrlShortcut('')).toBe(false);
  });

  it('does not match ftp:// URLs', () => {
    expect(isUrlShortcut('ftp://example.com')).toBe(false);
  });

  it('handles complex URLs', () => {
    expect(isUrlShortcut('https://docs.example.com/guide#section-1')).toBe(true);
    expect(isUrlShortcut('http://localhost:3000')).toBe(true);
  });
});

describe('search shortcut parsing', () => {
  it('finds positional query for search shortcut', () => {
    expect(getFirstSearchPositionalArg(['search', 'best pizza nyc'])).toBe('best pizza nyc');
  });

  it('skips values of long options before query', () => {
    const args = ['search', '--location', 'news', 'cats'];
    expect(getFirstSearchPositionalArg(args)).toBe('cats');
  });

  it('skips values of short options before query', () => {
    const args = ['search', '-o', 'out.json', 'cats'];
    expect(getFirstSearchPositionalArg(args)).toBe('cats');
  });

  it('recognizes known search subcommand values', () => {
    expect(isKnownSearchSubcommand('news')).toBe(true);
    expect(isKnownSearchSubcommand('cats')).toBe(false);
  });
});
