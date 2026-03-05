---
name: social-media-post
description: Create platform-specific social media posts from a niche, topic, campaign idea, or source material using research, source extraction, and tailored writing for channels like X, LinkedIn, Instagram, TikTok, or YouTube Shorts. Use when the user wants social content, post variants, threads, captions, or channel-specific copy.
---

# Social Media Post

## Overview

Turn a niche, topic, or campaign idea into platform-specific social media posts using the DumplingAI CLI.

## Allowed Commands

```bash
dumplingai search <query>     # Research the topic, audience pain points, and supporting sources
dumplingai scrape <url>       # Pull details from articles, docs, product pages, or landing pages
dumplingai transcript <url>   # Optional: extract source material from a video
```

## Workflow

1. Start by identifying:
   - the niche or topic
   - the target audience
   - the goal of the post
   - the target platform or platforms
2. Research the topic first with `search`, then deepen with `scrape` on the most relevant pages.
3. Extract the core message, hook, proof points, objections, and CTA angle.
4. Draft platform-specific copy for the requested channels, such as:
   - X post or thread
   - LinkedIn post
   - Instagram caption
   - TikTok or YouTube Short caption
5. Adapt the writing to the platform:
   - X: concise, sharp, thread-friendly
   - LinkedIn: clearer structure, higher signal, more professional tone
   - Instagram/TikTok: hook-heavy, punchy, simpler CTA
6. Keep claims grounded in the research and avoid inflating results or certainty.
7. If the user provides a primary source such as a blog post, landing page, or video, use it as input material rather than starting from scratch.

## Output Strategy

Write research artifacts to `.dumplingai/` before drafting:

```bash
dumplingai search "AI sales assistant pain points for SMB founders" -o .dumplingai/search.md
dumplingai scrape https://example.com/product-page -o .dumplingai/product.md
dumplingai transcript https://youtube.com/watch?v=ID -o .dumplingai/transcript.txt
```

Then read incrementally:

```bash
head -80 .dumplingai/search.md
rg -n "pain point|feature|benefit|result|pricing|audience" .dumplingai/product.md
sed -n '1,120p' .dumplingai/product.md
```

## Writing Guidelines

- Lead with a sharp hook, not setup.
- Start from the audience's problem, desire, or curiosity.
- Compress long-form material into one idea per sentence.
- Keep claims specific and grounded in research or provided source material.
- Avoid hashtags unless the user asks for them.
- Produce multiple variants when tone is ambiguous: straightforward, punchy, and promotional.
- Default to drafting at least one version per requested platform, not one generic post for all platforms.

## Example

```bash
# Research the niche first
dumplingai search "B2B SaaS onboarding mistakes founder audience" -o .dumplingai/search.md

# Pull a primary source if available
dumplingai scrape https://example.com/blog-post -o .dumplingai/source.md

# Optional: use a video as source material
dumplingai transcript https://youtube.com/watch?v=ID -o .dumplingai/transcript.txt
```

## Safety

See `rules/safety.md` for source-handling and claim-verification rules.
