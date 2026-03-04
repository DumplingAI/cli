# Installation

## Quick Start (npx)

```bash
npx -y @dumplingai/cli init
```

## Global Install

```bash
npm install -g @dumplingai/cli
# or
pnpm add -g @dumplingai/cli
```

## PATH Troubleshooting

If `dumplingai` is not found after global install:

```bash
# npm global bin path
npm config get prefix
# Add <prefix>/bin to PATH
export PATH="$(npm config get prefix)/bin:$PATH"
```
