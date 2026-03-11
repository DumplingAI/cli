# AGENTS.md

Guidelines for contributors working on the DumplingAI CLI skills in this repository.

## Repository Focus

This repo ships:

- the `dumplingai-cli` npm package under `packages/cli/`
- bundled agent skills under `skills/`
- install-time copies of those skills embedded in `packages/cli/src/commands/setup-skill.ts`

## Skill Discovery Rule

For skill triggerability, the frontmatter `description` is retrieval copy, not just documentation.

Every skill description should cover:

1. What the skill helps the user accomplish
2. The phrases a user is likely to say
3. When to use this skill instead of a nearby one

Prefer multiple narrow, job-shaped skills over one generic integration skill when users commonly ask for the workflows in different language. Broad umbrella skills are still useful, but they should be backed by more specific entry points like search, scraping, transcripts, and SEO data.

Prefer:

```yaml
description: When the user wants to find the right API for scraping or search. Also use when the user mentions Firecrawl, Serper, transcripts, or SEO APIs. For executing the chosen endpoint, see dumplingai-cli.
```

Avoid descriptions that only describe the underlying tool, such as "CLI for DumplingAI" with no user-intent language.

## Keep Sources in Sync

When editing a bundled skill:

1. Update `skills/<name>/SKILL.md`
2. Update the matching embedded string in `packages/cli/src/commands/setup-skill.ts`
3. If trigger guidance changes, update `README.md`

## Validation

- Keep skill names aligned with directory names
- Keep descriptions concise but rich in trigger phrases
- Prefer concrete user intents and vendor/task synonyms over internal product terminology
