const DEFAULT_BASE_URL = 'https://app.dumplingai.com';
const DEFAULT_TIMEOUT_MS = 30_000;
const REQUEST_SOURCE = 'API' as const;

// ── Types ──────────────────────────────────────────────────────────────────

export interface ScrapeOptions {
  format?: 'markdown' | 'html' | 'screenshot';
  cleaned?: boolean;
  renderJs?: boolean;
}

export interface ScrapeResult {
  title?: string;
  url?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SearchOptions {
  country?: string;
  location?: string;
  language?: string;
  dateRange?: 'pastHour' | 'pastDay' | 'pastWeek' | 'pastMonth' | 'pastYear' | 'anyTime';
  page?: number;
  scrapeResults?: boolean;
  numResultsToScrape?: number;
}

export interface SearchOrganicResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  date?: string | null;
  scrapeOutput?: {
    title?: string;
    url?: string;
    content?: string;
    format?: string;
    cleaned?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SearchResult {
  searchParameters?: Record<string, unknown>;
  organic?: SearchOrganicResult[];
  featuredSnippet?: Record<string, unknown>;
  relatedSearches?: Array<{ query: string }>;
  [key: string]: unknown;
}

export interface NewsSearchOptions {
  country?: string;
  location?: string;
  language?: string;
  dateRange?: 'pastHour' | 'pastDay' | 'pastWeek' | 'pastMonth' | 'pastYear' | 'anyTime';
  page?: number;
}

export interface NewsArticle {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string | null;
  position: number;
}

export interface NewsSearchResult {
  searchParameters?: Record<string, unknown>;
  news: NewsArticle[];
  [key: string]: unknown;
}

export interface PlacesSearchOptions {
  country?: string;
  location?: string;
  language?: string;
  page?: number;
}

export interface PlacesResult {
  position: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  website?: string | null;
  cid: string;
  rating?: number | null;
  ratingCount?: number | null;
  category?: string | null;
  phoneNumber?: string | null;
}

export interface PlacesSearchResult {
  searchParameters?: Record<string, unknown>;
  places: PlacesResult[];
  [key: string]: unknown;
}

export interface MapsSearchOptions {
  gpsPositionZoom?: string;
  placeId?: string;
  cid?: string;
  language?: string;
  page?: number;
}

export interface MapsPlaceResult {
  position: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string | null;
  types?: string[];
  website?: string | null;
  cid: string;
  fid?: string | null;
  placeId?: string | null;
  [key: string]: unknown;
}

export interface MapsSearchResult {
  searchParameters?: Record<string, unknown>;
  places: MapsPlaceResult[];
  [key: string]: unknown;
}

export interface GoogleReviewsOptions {
  cid?: string;
  placeId?: string;
  reviews?: number;
  language?: string;
  location?: string;
  sortBy?: 'relevant' | 'newest' | 'highest_rating' | 'lowest_rating';
}

export interface GoogleReviewsResult {
  [key: string]: unknown;
}

export interface AutocompleteOptions {
  location?: string;
  country?: string;
  language?: string;
}

export interface AutocompleteResult {
  searchParameters?: Record<string, unknown>;
  suggestions: Array<{ value: string }>;
  [key: string]: unknown;
}

export interface TranscriptOptions {
  preferredLanguage?: string;
  includeTimestamps?: boolean;
  chunkSize?: number;
}

export interface TranscriptResult {
  transcript?: string | Array<{ text: string; start?: number; duration?: number }>;
  transcriptLanguage?: string;
  [key: string]: unknown;
}

export interface ValidateKeyResult {
  authenticated: boolean;
  keyName?: string;
  [key: string]: unknown;
}

export interface StatusResult {
  authenticated: boolean;
  keyName?: string;
  [key: string]: unknown;
}

// ── Client ─────────────────────────────────────────────────────────────────

export class DumplingAIClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(opts: { apiKey: string; baseUrl?: string; timeoutMs?: number }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async request<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const payload = { ...body, requestSource: REQUEST_SOURCE };

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          let message = `HTTP ${res.status} ${res.statusText}`;
          try {
            const err = (await res.json()) as { error?: string };
            if (err.error) message = err.error;
          } catch {
            // ignore json parse error
          }

          if (res.status === 401) {
            throw new ApiError('Invalid or missing API key. Run `dumplingai login` to authenticate.', 401);
          }
          if (res.status === 400) {
            throw new ApiError(message, 400);
          }
          if (res.status >= 500 && attempt === 0) {
            lastError = new ApiError(message, res.status);
            await sleep(1000);
            continue;
          }
          throw new ApiError(message, res.status);
        }

        return (await res.json()) as T;
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof ApiError) throw err;
        if ((err as Error).name === 'AbortError') {
          throw new ApiError(`Request timed out after ${this.timeoutMs}ms`, 408);
        }
        lastError = err as Error;
        if (attempt === 0) {
          await sleep(1000);
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new ApiError('Request failed', 500);
  }

  async scrape(url: string, opts: ScrapeOptions = {}): Promise<ScrapeResult> {
    return this.request<ScrapeResult>('/api/v1/scrape', {
      url,
      format: opts.format ?? 'markdown',
      cleaned: opts.cleaned ?? true,
      renderJs: opts.renderJs ?? true,
    });
  }

  async search(query: string, opts: SearchOptions = {}): Promise<SearchResult> {
    return this.request<SearchResult>('/api/v1/search', {
      query,
      ...opts,
    });
  }

  async searchNews(query: string, opts: NewsSearchOptions = {}): Promise<NewsSearchResult> {
    return this.request<NewsSearchResult>('/api/v1/search-news', { query, ...opts });
  }

  async searchPlaces(query: string, opts: PlacesSearchOptions = {}): Promise<PlacesSearchResult> {
    return this.request<PlacesSearchResult>('/api/v1/search-places', { query, ...opts });
  }

  async searchMaps(query: string, opts: MapsSearchOptions = {}): Promise<MapsSearchResult> {
    return this.request<MapsSearchResult>('/api/v1/search-maps', { query, ...opts });
  }

  async getGoogleReviews(keyword: string, opts: GoogleReviewsOptions = {}): Promise<GoogleReviewsResult> {
    return this.request<GoogleReviewsResult>('/api/v1/get-google-reviews', { keyword, ...opts });
  }

  async autocomplete(query: string, opts: AutocompleteOptions = {}): Promise<AutocompleteResult> {
    return this.request<AutocompleteResult>('/api/v1/get-autocomplete', { query, ...opts });
  }

  async transcript(url: string, opts: TranscriptOptions = {}): Promise<TranscriptResult> {
    // Auto-detect platform from URL
    if (url.includes('tiktok.com')) {
      return this.request<TranscriptResult>('/api/v1/get-tiktok-transcript', {
        videoUrl: url,
        ...opts,
      });
    }
    // Default to YouTube transcript
    return this.request<TranscriptResult>('/api/v1/get-youtube-transcript', {
      videoUrl: url,
      preferredLanguage: opts.preferredLanguage ?? 'en',
      includeTimestamps: opts.includeTimestamps ?? false,
      chunkSize: opts.chunkSize,
    });
  }

  async validateKey(): Promise<ValidateKeyResult> {
    const url = `${this.baseUrl}/api/v1/make/api-key-connection`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 401) {
        return { authenticated: false };
      }
      if (!res.ok) {
        throw new ApiError(`HTTP ${res.status} ${res.statusText}`, res.status);
      }

      const data = (await res.json()) as { metadata?: { name?: string } };
      return { authenticated: true, keyName: data.metadata?.name };
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof ApiError) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new ApiError(`Request timed out after ${this.timeoutMs}ms`, 408);
      }
      throw err;
    }
  }

  async getStatus(): Promise<StatusResult> {
    const result = await this.validateKey();
    return result;
  }
}

// ── Errors ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
