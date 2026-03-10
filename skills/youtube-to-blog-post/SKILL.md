---
name: youtube-to-blog-post
description: Turn a YouTube video into a structured blog post using transcript-first research and optional supporting-source verification. Use when the user wants to repurpose YouTube content into an article, blog post, outline, or written summary based on a video transcript.
---

# YouTube to Blog Post

## Overview

Turn a YouTube video into a structured blog post using DumplingAI v2 capabilities.

## Allowed Commands

```bash
dumplingai run capability get_youtube_transcript --input '{"videoUrl":"https://youtube.com/watch?v=ID"}'
dumplingai run capability google_search --input '{"query":"topic from the video"}'
dumplingai run capability scrape_page --input '{"url":"https://example.com/reference"}'
```

## Workflow

1. Fetch the transcript first and save it to `.dumplingai/transcript.json`.
2. Extract the main argument, audience, examples, and action items.
3. Verify outside claims with `google_search` and `scrape_page` when needed.
4. Draft a blog post that stays faithful to the transcript and cited sources.

## Output Strategy

```bash
dumplingai run capability get_youtube_transcript --input '{"videoUrl":"https://youtube.com/watch?v=ID"}' > .dumplingai/transcript.json
dumplingai run capability google_search --input '{"query":"company or concept from the video"}' > .dumplingai/search.json
dumplingai run capability scrape_page --input '{"url":"https://example.com/reference"}' > .dumplingai/reference.json
```

Read incrementally:

```bash
head -80 .dumplingai/transcript.json
rg '"transcript"|"text"|"results"' .dumplingai/transcript.json
```
