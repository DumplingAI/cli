---
name: dumplingai-cli
description: Use when working with the DumplingAI CLI to scrape webpages, search the web, or fetch YouTube and TikTok transcripts from the terminal. Trigger for tasks involving `dumplingai scrape`, `dumplingai search`, `dumplingai transcript`, or agent workflows that need DumplingAI CLI usage guidance.
---

# DumplingAI CLI Skill

## Overview

The `dumplingai` CLI translates terminal commands into DumplingAI API calls, enabling agents to scrape web content, run searches, and fetch video transcripts.

## Allowed Commands

```bash
dumplingai scrape <url>         # Fetch and parse a webpage
dumplingai search <query>       # Web search with organic results
dumplingai transcript <url>     # YouTube / TikTok transcript
```

## Escalation Order

When gathering web content, prefer in this order:
1. `search` — broad topic discovery, get multiple sources fast
2. `scrape` — targeted deep-read of a specific URL
3. `transcript` — video content (YouTube/TikTok)

## Output Strategy

Always write large outputs to `.dumplingai/` to keep context clean:

```bash
dumplingai scrape 'https://example.com' -o .dumplingai/page.md
dumplingai search "TypeScript 5.5 features" -o .dumplingai/search.md
dumplingai transcript 'https://youtube.com/watch?v=ID' -o .dumplingai/transcript.txt
```

Then read incrementally:
```bash
head -50 .dumplingai/page.md
rg "function" .dumplingai/page.md
```

## Examples

```bash
# Quick scrape (markdown, default)
dumplingai scrape 'https://docs.example.com/guide'

# HTML scrape
dumplingai scrape 'https://example.com' --format html -o .dumplingai/raw.html

# Search and scrape top results
dumplingai search "best TypeScript ORMs 2024" --scrape --json

# Get transcript in Spanish
dumplingai transcript 'https://youtube.com/watch?v=ID' --lang es

# URL shortcut (no subcommand needed)
dumplingai 'https://example.com/article'
```
Quote URLs in shell examples by default so special characters like `?` are passed through unchanged.

## Safety

See `rules/safety.md` for content trust and output handling guidelines.
See `rules/install.md` for installation instructions.
