---
name: dumplingai-web-research
description: When the user wants web research, search results, cited sources, or fast topic discovery through DumplingAI instead of manual browsing or a direct search API integration. Also use when the user mentions Google search, SERP results, web search, search for sources, topic research, competitor research, answer sources, Serper, Perplexity, or wants to compare what the web says about something. Use this whenever the job is to search first, then inspect or synthesize results. For scraping a specific page or site after discovery, see dumplingai-scraping-extraction.
---

# DumplingAI Web Research

## Allowed Commands

```bash
dumplingai catalog search <prompt>
dumplingai catalog details <type> <id>
dumplingai run <type> <id> --input '<json>'
```

## Workflow

1. Translate the task into a short keyword query such as `google search`, `web search`, or `perplexity search`.
2. Run `dumplingai catalog search "<job>"`.
3. Inspect the best candidate with `dumplingai catalog details <type> <id>`.
4. Execute the search capability or endpoint with a focused query.
5. Save large outputs under `.dumplingai/` and read them incrementally.
6. If the user needs page-level content extraction after discovery, hand off to `dumplingai-scraping-extraction`.

## Search Phrases

- `google search`
- `web search`
- `serper search`
- `perplexity search`
- `news search`

## Output Strategy

```bash
dumplingai catalog search "google search" > .dumplingai/catalog-search.json
dumplingai catalog details capability google_search > .dumplingai/google-search.json
dumplingai run capability google_search --input '{"query":"best AI meeting notes tools for startups"}' > .dumplingai/search-results.json
head -60 .dumplingai/search-results.json
rg '"title"|"url"|"snippet"|"results"' .dumplingai/search-results.json
```
