# DumplingAI CLI

Use DumplingAI's Unified API Platform from the terminal. The CLI is built for agent and developer workflows around `/api/v2`: discover capabilities, inspect provider endpoints, execute requests, and inspect usage.

## Quick Start

```bash
# Option 1: No install required
npx -y dumplingai-cli init

# Option 2: Global install
npm install -g dumplingai-cli
dumplingai login --api-key sk_yourkey
```

Get your API key at https://app.dumplingai.com/settings/api-keys

## Commands

| Command | Description |
|---------|-------------|
| `dumplingai init` | Authenticate and optionally install bundled agent skills |
| `dumplingai login --api-key <key>` | Save API credentials |
| `dumplingai logout` | Remove stored credentials |
| `dumplingai status` | Show CLI version, auth status, and v2 balance context |
| `dumplingai view-config` | Display current configuration |
| `dumplingai catalog search <prompt>` | Search v2 capabilities, providers, and endpoints |
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
dumplingai catalog search "google search capability"

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

## Skill Installation

Packaged skills from this repo can be installed with the `skills` CLI:

```bash
npx skills add dumplingai/cli
npx skills add dumplingai/cli --list
npx skills add dumplingai/cli --skill discovering-dumplingai-apis --skill dumplingai-cli --skill youtube-to-blog-post --skill social-media-post
```

## Development

```bash
pnpm install
pnpm --filter dumplingai-cli build
pnpm --filter dumplingai-cli test
pnpm --filter dumplingai-cli typecheck
```

Local agent/runtime folders such as `.claude/`, `.agents/`, `.cursor/`, `.codex/`, and `.dumplingai/` are intentionally ignored. Keep checked-in skill sources under `skills/`.
