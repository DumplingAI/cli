import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DumplingAIClient } from '../../src/client/api.js';

describe('DumplingAIClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('sends catalog search requests to /api/v2/search', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new DumplingAIClient({ apiKey: 'sk_test' });
    await client.searchCatalog('google search', { type: 'capability', limit: 5 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://app.dumplingai.com/api/v2/search');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer sk_test',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(init.body as string)).toEqual({
      prompt: 'google search',
      type: 'capability',
      limit: 5,
      requestSource: 'CLI',
    });
  });

  it('builds usage query strings for /api/v2/usage', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new DumplingAIClient({ apiKey: 'sk_test' });
    await client.getUsage({
      objectType: 'endpoint',
      status: 'success',
      provider: 'firecrawl',
      objectId: 'firecrawl.scrape',
      page: 2,
      limit: 25,
    });

    const [rawUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const url = new URL(rawUrl);

    expect(url.pathname).toBe('/api/v2/usage');
    expect(url.searchParams.get('objectType')).toBe('endpoint');
    expect(url.searchParams.get('status')).toBe('success');
    expect(url.searchParams.get('provider')).toBe('firecrawl');
    expect(url.searchParams.get('objectId')).toBe('firecrawl.scrape');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('limit')).toBe('25');
    expect(url.searchParams.get('requestSource')).toBe('CLI');
    expect(init.method).toBe('GET');
  });

  it('treats a 401 balance response as unauthenticated during validation', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = new DumplingAIClient({ apiKey: 'sk_test' });
    await expect(client.validateKey()).resolves.toEqual({ authenticated: false });
  });
});
