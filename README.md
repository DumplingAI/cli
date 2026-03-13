# DumplingAI CLI

Use DumplingAI's Unified API Platform from the terminal. The CLI is built for agent and developer workflows around `/api/v2`: discover capabilities, inspect provider endpoints, execute requests, and inspect usage.

## Quick Start

```bash
npm install -g dumplingai-cli
dumplingai init
```

Get your API key at https://app.dumplingai.com/api-keys

## Commands

| Command | Description |
|---------|-------------|
| `dumplingai init` | Authenticate and optionally install bundled agent skills |
| `dumplingai login` | Save API credentials interactively or with `--api-key` |
| `dumplingai logout` | Remove stored credentials |
| `dumplingai status` | Show CLI version, auth status, and v2 balance context |
| `dumplingai view-config` | Display current configuration |
| `dumplingai catalog search <prompt>` | Search v2 capabilities, providers, and endpoints with short keyword queries |
| `dumplingai catalog details <type> <id>` | Inspect a specific catalog object |
| `dumplingai run <type> <id> --input '<json>'` | Execute a capability or endpoint |
| `dumplingai balance` | Show balance and budget information |
| `dumplingai usage` | Show request usage logs |
| `dumplingai transactions` | Show credit transaction history |
| `dumplingai env pull` | Write API key to `.env` file |
| `dumplingai version` | Print version |

## Usage Examples

```bash
# Discover available capabilities
dumplingai catalog search "google search"

# Inspect a capability before running it
dumplingai catalog details capability google_search

# Execute a capability with inline JSON input
dumplingai run capability google_search --input '{"query":"latest TypeScript release"}'

# Execute an endpoint with JSON from disk
dumplingai run endpoint firecrawl.scrape --input-file payload.json

# Inspect account data
dumplingai balance
dumplingai usage --object-type capability --limit 20
```

Redirect large JSON results into `.dumplingai/` when you want to inspect them incrementally:

```bash
dumplingai run capability scrape_page --input '{"url":"https://example.com"}' > .dumplingai/page.json
head -40 .dumplingai/page.json
```

## Catalog Search Tips

`dumplingai catalog search` behaves more like keyword search than semantic search. Use short phrases such as `google search`, `scrape page`, `youtube transcript`, `keyword ideas`, or `firecrawl scrape`.

Avoid long natural-language prompts and avoid appending generic words like `capability` or `endpoint` unless they are actually part of the object name. If results are empty or weak, shorten the query first.

## Skill Installation

Packaged skills from this repo can be installed with the `skills` CLI:

```bash
npx skills add dumplingai/cli
npx skills add dumplingai/cli --list
npx skills add dumplingai/cli --skill discovering-dumplingai-apis --skill dumplingai-cli --skill dumplingai-web-research --skill dumplingai-scraping-extraction --skill dumplingai-transcripts-media --skill dumplingai-seo-data --skill youtube-to-blog-post --skill social-media-post
```

## When Skills Should Trigger

The main lesson from high-performing skill repos is that discovery copy should describe user intent, not just implementation details. These are the bundled skills and the kinds of requests they should catch:

| Skill | Trigger this when the user says things like |
|-------|---------------------------------------------|
| `discovering-dumplingai-apis` | "Find the best API for scraping/search/transcripts", "Can DumplingAI do this instead of Firecrawl/Serper/DataForSEO?", "I want one API key across providers" |
| `dumplingai-cli` | "Run this through DumplingAI", "search the DumplingAI catalog", "inspect this capability", "check DumplingAI balance/usage", "test this endpoint from the terminal" |
| `dumplingai-web-research` | "Search the web for this", "find sources on this topic", "run Google/Serper/Perplexity-style search through DumplingAI", "do competitor/topic research first" |
| `dumplingai-scraping-extraction` | "Scrape this page", "crawl this site", "extract content from this URL", "pull structured content with Firecrawl-style tooling" |
| `dumplingai-transcripts-media` | "Get the YouTube transcript", "transcribe this video", "extract captions from this media URL", "turn video/audio into text" |
| `dumplingai-seo-data` | "Get keyword ideas", "pull SEO data", "use DataForSEO through DumplingAI", "find ranking/search-volume endpoints" |
| `youtube-to-blog-post` | "Turn this YouTube video into a post", "extract the transcript and draft an article", "repurpose this creator video into a newsletter/blog" |
| `social-media-post` | "Turn this topic/page/transcript into LinkedIn or X posts", "write thread variants", "give me channel-specific social copy" |

If a skill description only says what the tool is, it tends to under-trigger. If it says what the user is trying to accomplish and includes the phrases they are likely to use, it triggers more reliably.

## Development

```bash
pnpm install
pnpm --filter dumplingai-cli build
pnpm --filter dumplingai-cli test
pnpm --filter dumplingai-cli typecheck
```

Local agent/runtime folders such as `.claude/`, `.agents/`, `.cursor/`, `.codex/`, and `.dumplingai/` are intentionally ignored. Keep checked-in skill sources under `skills/`.

Stored credentials are written to a local config file. Prefer `DUMPLINGAI_API_KEY` in CI or shared environments.
