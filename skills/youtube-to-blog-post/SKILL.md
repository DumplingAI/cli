---
name: youtube-to-blog-post
description: Turn a YouTube video into a structured blog post using transcript-first research and optional supporting-source verification. Use when the user wants to repurpose YouTube content into an article, blog post, outline, or written summary based on a video transcript.
---

# YouTube to Blog Post

## Overview

Turn a YouTube video into a structured blog post using the DumplingAI CLI.

## Allowed Commands

```bash
dumplingai transcript <youtube-url>   # Fetch the source transcript
dumplingai search <query>             # Find supporting sources and citations
dumplingai scrape <url>               # Read specific references in depth
```

## Workflow

1. Fetch the transcript first and save it to `.dumplingai/transcript.txt`.
2. Read the transcript incrementally and extract:
   - the main argument
   - the audience
   - notable examples, quotes, and action items
3. Draft a blog post with:
   - a title
   - a short introduction
   - clear section headings
   - a concise conclusion
4. If the video references external tools, companies, or claims that benefit from citations, use `search` and `scrape` to verify them before including them.
5. Keep the post faithful to the source. Do not invent examples, metrics, or claims that do not appear in the transcript or cited sources.

## Output Strategy

Always write intermediate artifacts to `.dumplingai/`:

```bash
dumplingai transcript 'https://youtube.com/watch?v=ID' -o .dumplingai/transcript.txt
dumplingai search "company or concept from the video" -o .dumplingai/search.md
dumplingai scrape 'https://example.com/reference' -o .dumplingai/reference.md
```

Then read incrementally:

```bash
head -80 .dumplingai/transcript.txt
rg -n "hook|CTA|pricing|example|story" .dumplingai/transcript.txt
sed -n '80,180p' .dumplingai/transcript.txt
```

## Writing Guidelines

- Prefer paraphrasing over copying transcript wording.
- Preserve the speaker's actual claims and level of certainty.
- Remove filler, repetition, sponsor reads, and off-topic asides unless they matter to the post.
- Convert spoken language into tighter written prose.
- When the transcript is thin or noisy, produce an outline first and flag uncertainty.

## Example

```bash
# Step 1: fetch the transcript
dumplingai transcript 'https://youtube.com/watch?v=ID' -o .dumplingai/transcript.txt

# Step 2: verify referenced claims if needed
dumplingai search "site:docs.example.com feature mentioned in the video" -o .dumplingai/search.md

# Step 3: scrape the best supporting source
dumplingai scrape 'https://docs.example.com/feature' -o .dumplingai/feature.md
```
Quote URLs in shell examples by default so special characters like `?` are passed through to the CLI.

## Safety

See `rules/safety.md` for source-handling and verification rules.
