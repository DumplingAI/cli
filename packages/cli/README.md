# DumplingAI CLI

`dumplingai-cli` is the official DumplingAI command-line tool for scraping pages, searching the web, and fetching video transcripts.

## Install

```bash
# run without installing
npx -y dumplingai-cli init

# or install globally
npm install -g dumplingai-cli
```

## Skill Installation

Install packaged skills from this repo with the `skills` CLI:

```bash
# Install
npx skills add dumplingai/cli

# List available skills in this repo
npx skills add dumplingai/cli --list

# Install all skills from this repo
npx skills add dumplingai/cli --all

# Install specific skills from this repo
npx skills add dumplingai/cli --skill dumplingai-cli --skill youtube-to-blog-post --skill social-media-post
```

## Quick Start

```bash
dumplingai login --api-key sk_yourkey
dumplingai scrape https://example.com
```

## Commands

- `dumplingai init`
- `dumplingai login --api-key <key>`
- `dumplingai logout`
- `dumplingai status`
- `dumplingai view-config`
- `dumplingai scrape <url>`
- `dumplingai search <query>`
- `dumplingai transcript <url>`
- `dumplingai env pull`
- `dumplingai version`

## Links

- Docs and product: https://www.dumplingai.com
- API keys: https://app.dumplingai.com/settings/api-keys
- Repository: https://github.com/dumplingai/cli
- Issues: https://github.com/dumplingai/cli/issues
