const KNOWN_SUBCOMMANDS = [
  'init', 'login', 'logout', 'status', 'view-config',
  'version', 'env', 'setup', 'scrape', 'search', 'transcript',
  '--version', '-V', '--help', '-h',
];

const KNOWN_SEARCH_SUBCOMMANDS = ['web', 'news', 'places', 'maps', 'reviews', 'autocomplete'];

const SEARCH_OPTIONS_WITH_VALUE = new Set([
  '--api-key',
  '--country',
  '--language',
  '--location',
  '--date-range',
  '--num-to-scrape',
  '--page',
  '--gps',
  '--place-id',
  '--cid',
  '--limit',
  '--sort-by',
  '--output',
  '-o',
]);

export function isKnownSubcommand(arg: string): boolean {
  return KNOWN_SUBCOMMANDS.includes(arg);
}

export function isKnownSearchSubcommand(arg: string): boolean {
  return KNOWN_SEARCH_SUBCOMMANDS.includes(arg);
}

export function getFirstSearchPositionalArg(args: string[]): string | undefined {
  let forcePositional = false;
  for (let i = 1; i < args.length; i++) {
    const token = args[i];
    if (!token) continue;

    if (forcePositional) return token;
    if (token === '--') {
      forcePositional = true;
      continue;
    }

    if (token.startsWith('--')) {
      const [longOpt] = token.split('=');
      if (SEARCH_OPTIONS_WITH_VALUE.has(longOpt) && !token.includes('=')) {
        i += 1;
      }
      continue;
    }

    if (token.startsWith('-')) {
      if (SEARCH_OPTIONS_WITH_VALUE.has(token)) {
        i += 1;
      }
      continue;
    }

    return token;
  }
  return undefined;
}
