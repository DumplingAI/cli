# DumplingAI CLI

`dumplingai-cli` is the official command-line tool for DumplingAI's Unified API Platform under `/api/v2`.

## Install

```bash
# run without installing
npx -y dumplingai-cli init

# or install globally
npm install -g dumplingai-cli
```

## Quick Start

```bash
dumplingai login --api-key sk_yourkey
dumplingai catalog search "google search capability"
dumplingai run capability google_search --input '{"query":"latest TypeScript release"}'
```

## Commands

- `dumplingai init`
- `dumplingai login --api-key <key>`
- `dumplingai logout`
- `dumplingai status`
- `dumplingai view-config`
- `dumplingai catalog search <prompt>`
- `dumplingai catalog details <type> <id>`
- `dumplingai run <type> <id> --input '<json>'`
- `dumplingai balance`
- `dumplingai usage`
- `dumplingai transactions`
- `dumplingai env pull`
- `dumplingai version`

## Links

- Docs: https://docs.dumplingai.com/unified-api-platform
- API keys: https://app.dumplingai.com/settings/api-keys
- Workbench: https://app.dumplingai.com/workbench
- Repository: https://github.com/dumplingai/cli
