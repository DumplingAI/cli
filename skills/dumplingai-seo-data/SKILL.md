---
name: dumplingai-seo-data
description: When the user wants SEO, keyword, ranking, SERP, competitor visibility, or provider-native marketing data through DumplingAI instead of wiring a direct SEO vendor API. Also use when the user mentions keyword ideas, search volume, ranking data, SEO APIs, DataForSEO, SERP APIs, keyword research, competitor keywords, backlink-style provider data, or wants one API key across SEO data providers. Use this whenever the task is about finding or running SEO and search-marketing data endpoints. For general web research without SEO-specific data needs, see dumplingai-web-research.
---

# DumplingAI SEO Data

## Allowed Commands

```bash
dumplingai catalog search <prompt>
dumplingai catalog details <type> <id>
dumplingai run <type> <id> --input '<json>'
```

## Workflow

1. Convert the task into a short keyword query such as `keyword ideas`, `seo`, or `dataforseo`.
2. Run `dumplingai catalog search "<job>"`.
3. Inspect the best candidate with `dumplingai catalog details <type> <id>`.
4. Execute with the target keyword, domain, locale, or other required payload.
5. Save large responses under `.dumplingai/` and inspect only the needed fields.
6. Prefer provider-native endpoints when the user explicitly wants DataForSEO-style outputs.

## Search Phrases

- `keyword ideas`
- `seo`
- `dataforseo`
- `serp keyword`
- `rank tracking`

## Output Strategy

```bash
dumplingai catalog search "keyword ideas" > .dumplingai/catalog-search.json
dumplingai catalog details endpoint dataforseo.keyword_ideas > .dumplingai/keyword-ideas.json
dumplingai run endpoint dataforseo.keyword_ideas --input '{"keyword":"ai meeting notes","location":"United States"}' > .dumplingai/keyword-results.json
head -80 .dumplingai/keyword-results.json
rg '"keyword"|"volume"|"difficulty"|"results"' .dumplingai/keyword-results.json
```
