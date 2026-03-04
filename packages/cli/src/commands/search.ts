import { Command } from 'commander';
import { requireAuth } from '../utils/auth.js';
import {
  DumplingAIClient,
  SearchOptions,
  SearchResult,
  NewsSearchResult,
  PlacesSearchResult,
  MapsSearchResult,
  GoogleReviewsResult,
  AutocompleteResult,
} from '../client/api.js';
import { getApiUrl } from '../utils/config.js';
import { printResult, exitWithError } from '../utils/output.js';

const DATE_RANGES = ['pastHour', 'pastDay', 'pastWeek', 'pastMonth', 'pastYear', 'anyTime'];

function commonOpts(cmd: Command): Command {
  return cmd
    .option('--json', 'Output raw JSON response')
    .option('-o, --output <file>', 'Write output to file instead of stdout')
    .option('--api-key <key>', 'Override API key for this request');
}

function commonLocaleOpts(cmd: Command): Command {
  return commonOpts(cmd)
    .option('--country <code>', 'Country code (e.g. us, gb)')
    .option('--language <code>', 'Language code (e.g. en, fr)')
    .option('--location <loc>', 'Free-form location context');
}

async function getClient(apiKey?: string): Promise<DumplingAIClient> {
  const key = await requireAuth(apiKey);
  return new DumplingAIClient({ apiKey: key, baseUrl: getApiUrl() });
}

// ── Formatters ──────────────────────────────────────────────────────────────

function fmtWeb(result: SearchResult): string {
  const lines: string[] = [];
  if (result.featuredSnippet) {
    const s = result.featuredSnippet as Record<string, unknown>;
    lines.push(`## Featured Snippet\n${s['snippet'] ?? ''}\n`);
  }
  for (const r of result.organic ?? []) {
    lines.push(`### ${r.position}. ${r.title}\n${r.link}\n${r.snippet}`);
    if (r.scrapeOutput?.content) lines.push('\n' + r.scrapeOutput.content);
    lines.push('');
  }
  return lines.join('\n');
}

function fmtNews(result: NewsSearchResult): string {
  return result.news.map((a) =>
    `### ${a.position}. ${a.title}\n${a.link}\n${a.source} · ${a.date}\n${a.snippet}`,
  ).join('\n\n');
}

function fmtPlaces(result: PlacesSearchResult): string {
  return result.places.map((p) => {
    const parts = [`### ${p.position}. ${p.title}`, p.address];
    if (p.rating) parts.push(`Rating: ${p.rating} (${p.ratingCount ?? 0} reviews)`);
    if (p.category) parts.push(`Category: ${p.category}`);
    if (p.phoneNumber) parts.push(`Phone: ${p.phoneNumber}`);
    if (p.website) parts.push(`Website: ${p.website}`);
    return parts.join('\n');
  }).join('\n\n');
}

function fmtMaps(result: MapsSearchResult): string {
  return result.places.map((p) => {
    const parts = [`### ${p.position}. ${p.title}`, p.address];
    if (p.type) parts.push(`Type: ${p.type}`);
    if (p.website) parts.push(`Website: ${p.website}`);
    parts.push(`Coords: ${p.latitude}, ${p.longitude}`);
    return parts.join('\n');
  }).join('\n\n');
}

function fmtReviews(result: GoogleReviewsResult): string {
  const reviews = (result['reviews'] ?? result['placeReviews']) as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(reviews)) return JSON.stringify(result, null, 2);
  return reviews.map((r, i) => {
    const parts = [`### ${i + 1}. ${r['author'] ?? 'Anonymous'}`];
    if (r['rating']) parts.push(`Rating: ${r['rating']}`);
    if (r['date']) parts.push(`Date: ${r['date']}`);
    if (r['text']) parts.push(String(r['text']));
    return parts.join('\n');
  }).join('\n\n');
}

function fmtAutocomplete(result: AutocompleteResult): string {
  return result.suggestions.map((s) => s.value).join('\n');
}

// ── Subcommands ─────────────────────────────────────────────────────────────

function makeWebCmd(): Command {
  return commonLocaleOpts(
    new Command('web')
      .description('Web search returning organic results')
      .argument('<query>', 'Search query')
      .option('--date-range <range>', `Date filter: ${DATE_RANGES.join(', ')}`)
      .option('--scrape', 'Also scrape top results for rich content')
      .option('--num-to-scrape <n>', 'Number of top results to scrape (1-10)', '3'),
  ).action(async (query: string, opts: Record<string, string | boolean | undefined>) => {
    if (opts['dateRange'] && !DATE_RANGES.includes(opts['dateRange'] as string)) {
      exitWithError(`Invalid --date-range. Valid: ${DATE_RANGES.join(', ')}`);
    }
    const client = await getClient(opts['apiKey'] as string | undefined);
    try {
      const result = await client.search(query, {
        country: opts['country'] as string | undefined,
        language: opts['language'] as string | undefined,
        location: opts['location'] as string | undefined,
        dateRange: opts['dateRange'] as SearchOptions['dateRange'],
        scrapeResults: opts['scrape'] as boolean | undefined,
        numResultsToScrape: opts['numToScrape'] ? parseInt(opts['numToScrape'] as string, 10) : undefined,
      });
      printResult(opts['json'] ? result : fmtWeb(result), { json: !!opts['json'], output: opts['output'] as string | undefined });
    } catch (err) { exitWithError((err as Error).message); }
  });
}

function makeNewsCmd(): Command {
  return commonLocaleOpts(
    new Command('news')
      .description('Search news articles')
      .argument('<query>', 'Search query')
      .option('--date-range <range>', `Date filter: ${DATE_RANGES.join(', ')}`)
      .option('--page <n>', 'Page number'),
  ).action(async (query: string, opts: Record<string, string | boolean | undefined>) => {
    if (opts['dateRange'] && !DATE_RANGES.includes(opts['dateRange'] as string)) {
      exitWithError(`Invalid --date-range. Valid: ${DATE_RANGES.join(', ')}`);
    }
    const client = await getClient(opts['apiKey'] as string | undefined);
    try {
      const result = await client.searchNews(query, {
        country: opts['country'] as string | undefined,
        language: opts['language'] as string | undefined,
        location: opts['location'] as string | undefined,
        dateRange: opts['dateRange'] as 'pastHour' | 'pastDay' | 'pastWeek' | 'pastMonth' | 'pastYear' | 'anyTime' | undefined,
        page: opts['page'] ? parseInt(opts['page'] as string, 10) : undefined,
      });
      printResult(opts['json'] ? result : fmtNews(result), { json: !!opts['json'], output: opts['output'] as string | undefined });
    } catch (err) { exitWithError((err as Error).message); }
  });
}

function makePlacesCmd(): Command {
  return commonLocaleOpts(
    new Command('places')
      .description('Search Google Places (businesses, POIs)')
      .argument('<query>', 'Search query')
      .option('--page <n>', 'Page number'),
  ).action(async (query: string, opts: Record<string, string | boolean | undefined>) => {
    const client = await getClient(opts['apiKey'] as string | undefined);
    try {
      const result = await client.searchPlaces(query, {
        country: opts['country'] as string | undefined,
        language: opts['language'] as string | undefined,
        location: opts['location'] as string | undefined,
        page: opts['page'] ? parseInt(opts['page'] as string, 10) : undefined,
      });
      printResult(opts['json'] ? result : fmtPlaces(result), { json: !!opts['json'], output: opts['output'] as string | undefined });
    } catch (err) { exitWithError((err as Error).message); }
  });
}

function makeMapsCmd(): Command {
  return commonOpts(
    new Command('maps')
      .description('Search Google Maps locations')
      .argument('<query>', 'Search query')
      .option('--gps <lat,lng,zoom>', 'GPS position zoom string (e.g. 51.5,-0.1,14)')
      .option('--place-id <id>', 'Google Place ID')
      .option('--cid <cid>', 'Google CID')
      .option('--language <code>', 'Language code')
      .option('--page <n>', 'Page number'),
  ).action(async (query: string, opts: Record<string, string | boolean | undefined>) => {
    const client = await getClient(opts['apiKey'] as string | undefined);
    try {
      const result = await client.searchMaps(query, {
        gpsPositionZoom: opts['gps'] as string | undefined,
        placeId: opts['placeId'] as string | undefined,
        cid: opts['cid'] as string | undefined,
        language: opts['language'] as string | undefined,
        page: opts['page'] ? parseInt(opts['page'] as string, 10) : undefined,
      });
      printResult(opts['json'] ? result : fmtMaps(result), { json: !!opts['json'], output: opts['output'] as string | undefined });
    } catch (err) { exitWithError((err as Error).message); }
  });
}

function makeReviewsCmd(): Command {
  return commonOpts(
    new Command('reviews')
      .description('Get Google reviews for a business')
      .argument('<keyword>', 'Business name or query')
      .option('--cid <cid>', 'Google CID identifier')
      .option('--place-id <id>', 'Google Place ID')
      .option('--limit <n>', 'Max reviews to return', '10')
      .option('--language <code>', 'Language code', 'en')
      .option('--location <loc>', 'Location bias for keyword search')
      .option('--sort-by <order>', 'Sort: relevant, newest, highest_rating, lowest_rating', 'relevant'),
  ).action(async (keyword: string, opts: Record<string, string | boolean | undefined>) => {
    const validSorts = ['relevant', 'newest', 'highest_rating', 'lowest_rating'];
    if (opts['sortBy'] && !validSorts.includes(opts['sortBy'] as string)) {
      exitWithError(`Invalid --sort-by. Valid: ${validSorts.join(', ')}`);
    }
    const client = await getClient(opts['apiKey'] as string | undefined);
    try {
      const result = await client.getGoogleReviews(keyword, {
        cid: opts['cid'] as string | undefined,
        placeId: opts['placeId'] as string | undefined,
        reviews: opts['limit'] ? parseInt(opts['limit'] as string, 10) : undefined,
        language: opts['language'] as string | undefined,
        location: opts['location'] as string | undefined,
        sortBy: opts['sortBy'] as 'relevant' | 'newest' | 'highest_rating' | 'lowest_rating' | undefined,
      });
      printResult(opts['json'] ? result : fmtReviews(result), { json: !!opts['json'], output: opts['output'] as string | undefined });
    } catch (err) { exitWithError((err as Error).message); }
  });
}

function makeAutocompleteCmd(): Command {
  return commonLocaleOpts(
    new Command('autocomplete')
      .description('Get search autocomplete suggestions')
      .argument('<query>', 'Partial search query'),
  ).action(async (query: string, opts: Record<string, string | boolean | undefined>) => {
    const client = await getClient(opts['apiKey'] as string | undefined);
    try {
      const result = await client.autocomplete(query, {
        country: opts['country'] as string | undefined,
        language: opts['language'] as string | undefined,
        location: opts['location'] as string | undefined,
      });
      printResult(opts['json'] ? result : fmtAutocomplete(result), { json: !!opts['json'], output: opts['output'] as string | undefined });
    } catch (err) { exitWithError((err as Error).message); }
  });
}

// ── Root search command ──────────────────────────────────────────────────────

export function makeSearchCommand(): Command {
  const search = new Command('search')
    .description('Search commands: web, news, places, maps, reviews, autocomplete');

  search.addCommand(makeWebCmd());
  search.addCommand(makeNewsCmd());
  search.addCommand(makePlacesCmd());
  search.addCommand(makeMapsCmd());
  search.addCommand(makeReviewsCmd());
  search.addCommand(makeAutocompleteCmd());

  return search;
}
