const DEFAULT_BASE_URL = 'https://app.dumplingai.com';
const DEFAULT_TIMEOUT_MS = 30_000;
const REQUEST_SOURCE = 'CLI';

export type CatalogObjectType = 'capability' | 'provider' | 'endpoint';
export type RunObjectType = Exclude<CatalogObjectType, 'provider'>;

export interface CatalogSearchOptions {
  limit?: number;
  type?: CatalogObjectType;
}

export interface UsageOptions {
  objectType?: CatalogObjectType;
  status?: string;
  provider?: string;
  objectId?: string;
  page?: number;
  limit?: number;
}

export interface TransactionsOptions {
  page?: number;
  limit?: number;
}

export interface RunOptions {
  input: Record<string, unknown>;
  provider?: string;
  includeNative?: boolean;
}

export interface ValidateKeyResult {
  authenticated: boolean;
}

export interface RequestOptions {
  body?: Record<string, unknown>;
  method?: 'GET' | 'POST';
  query?: Record<string, string | number | undefined>;
}

export class DumplingAIClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(opts: { apiKey: string; baseUrl?: string; timeoutMs?: number }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async request<T>(endpoint: string, opts: RequestOptions = {}): Promise<T> {
    const url = buildUrl(`${this.baseUrl}${endpoint}`, {
      ...opts.query,
      ...(opts.method === 'GET' || (!opts.method && !opts.body) ? { requestSource: REQUEST_SOURCE } : {}),
    });
    const method = opts.method ?? 'POST';
    const body = opts.body ? { ...opts.body, requestSource: REQUEST_SOURCE } : undefined;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const message = await getErrorMessage(res);

          if (res.status === 401) {
            throw new ApiError(
              'Invalid or missing API key. Run `dumplingai login` to authenticate.',
              401,
            );
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

  async searchCatalog(
    prompt: string,
    opts: CatalogSearchOptions = {},
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/api/v2/search', {
      body: {
        prompt,
        ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
        ...(opts.type ? { type: opts.type } : {}),
      },
    });
  }

  async getCatalogDetails(
    type: CatalogObjectType,
    id: string,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/api/v2/details', {
      body: { id, type },
    });
  }

  async run(
    type: RunObjectType,
    id: string,
    opts: RunOptions,
  ): Promise<Record<string, unknown>> {
    const body: Record<string, unknown> = {
      type,
      id,
      input: opts.input,
    };

    if (opts.provider) {
      body['provider'] = opts.provider;
    }
    if (opts.includeNative) {
      body['options'] = { include_native: true };
    }

    return this.request<Record<string, unknown>>('/api/v2/run', { body });
  }

  async getBalance(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/api/v2/balance', {
      method: 'GET',
    });
  }

  async getUsage(opts: UsageOptions = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/api/v2/usage', {
      method: 'GET',
      query: {
        objectType: opts.objectType,
        status: opts.status,
        provider: opts.provider,
        objectId: opts.objectId,
        page: opts.page,
        limit: opts.limit,
      },
    });
  }

  async getTransactions(opts: TransactionsOptions = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/api/v2/transactions', {
      method: 'GET',
      query: {
        page: opts.page,
        limit: opts.limit,
      },
    });
  }

  async validateKey(): Promise<ValidateKeyResult> {
    try {
      await this.getBalance();
      return { authenticated: true };
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        return { authenticated: false };
      }
      throw err;
    }
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getErrorMessage(res: Response): Promise<string> {
  try {
    const err = (await res.json()) as {
      error?: string;
      code?: string;
      message?: string;
    };
    if (err.error && err.code) {
      return `${err.error} (${err.code})`;
    }
    if (err.error) {
      return err.error;
    }
    if (err.message) {
      return err.message;
    }
  } catch {
    // Ignore JSON parse errors and fall back to the status text.
  }

  return `HTTP ${res.status} ${res.statusText}`;
}

function buildUrl(baseUrl: string, query?: Record<string, string | number | undefined>): string {
  if (!query) return baseUrl;

  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
