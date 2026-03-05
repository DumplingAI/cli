# DumplingAI CLI

Scrape, search, and extract web content from the terminal — powered by the [DumplingAI API](https://www.dumplingai.com).

## Quick Start

```bash
# Option 1: No install required
npx -y dumplingai-cli init

# Option 2: Global install
npm install -g dumplingai-cli
dumplingai login --api-key sk_yourkey
```

**Get your API key:** https://app.dumplingai.com/settings/api-keys

---

## Skill Installation

Packaged skills from this repo can be installed with the `skills` CLI:

```bash
# Install
npx skills add dumplingai/cli

# List available skills in this repo
npx skills add dumplingai/cli --list

# Install specific skills from this repo
npx skills add dumplingai/cli --skill dumplingai-cli --skill youtube-to-blog-post --skill social-media-post
```

By default, `npx skills add` installs into the current project. Use `-g` to install globally instead.

See `skills/dumplingai-cli/SKILL.md` for usage guidelines and escalation patterns.
Additional packaged skills live under `skills/`, including `skills/youtube-to-blog-post/SKILL.md` and `skills/social-media-post/SKILL.md`.

---

## Commands

| Command | Description |
|---------|-------------|
| `dumplingai init` | Interactive setup: authenticate + install agent skills |
| `dumplingai login --api-key <key>` | Save API credentials |
| `dumplingai logout` | Remove stored credentials |
| `dumplingai status` | Show auth status and CLI info |
| `dumplingai view-config` | Display current configuration |
| `dumplingai scrape <url>` | Scrape a webpage |
| `dumplingai search <query>` | Web search |
| `dumplingai transcript <url>` | Get YouTube/TikTok transcript |
| `dumplingai env pull` | Write API key to `.env` file |
| `dumplingai version` | Print version |

---

## Usage Examples

```bash
# Scrape a webpage (default: markdown)
dumplingai scrape 'https://docs.example.com'

# Scrape and save to file
dumplingai scrape 'https://example.com/article' -o article.md

# URL shortcut — no subcommand needed
dumplingai 'https://example.com'

# Web search
dumplingai search "TypeScript 5.5 new features"

# Search and scrape top results
dumplingai search "best React state management" --scrape

# Get YouTube transcript
dumplingai transcript 'https://youtube.com/watch?v=dQw4w9WgXcQ'

# Output as JSON
dumplingai scrape 'https://example.com' --json
```
Quote URLs in shell examples by default. This avoids `zsh` globbing issues with characters like `?` and keeps commands copy-paste safe.

---

## Authentication

```bash
# Login with API key
dumplingai login --api-key sk_yourkey

# Or use environment variable
export DUMPLINGAI_API_KEY=sk_yourkey

# Check auth status
dumplingai status

# Write to .env file
dumplingai env pull
```

Credentials are stored securely in your system keychain. On systems without a keychain, a file at `~/.config/dumplingai-cli/credentials.json` (mode 600) is used as fallback.

---

## Configuration

| Source | Priority |
|--------|----------|
| `--api-key` flag | Highest |
| `DUMPLINGAI_API_KEY` env var | 2nd |
| Credential store (keychain / file) | 3rd |
| Config file defaults | Lowest |

Config file location:
- macOS: `~/Library/Application Support/dumplingai-cli/config.json`
- Linux: `~/.config/dumplingai-cli/config.json`
- Windows: `%AppData%/dumplingai-cli/config.json`

---

## Development

```bash
pnpm install
pnpm --filter dumplingai-cli build
pnpm --filter dumplingai-cli test
node packages/cli/dist/index.js --help
```
