# Installation Guide

## Quick Start

```bash
# npm
npm install -g dumplingai-cli

# pnpm
pnpm add -g dumplingai-cli

# yarn
yarn global add dumplingai-cli
```

Then initialize and authenticate:

```bash
dumplingai init
```

## PATH Troubleshooting

If `dumplingai` is not found after global install:

```bash
# Find npm global bin directory
npm config get prefix
# e.g. /usr/local

# Add to PATH (add to ~/.bashrc or ~/.zshrc for persistence)
export PATH="$(npm config get prefix)/bin:$PATH"
```

## Verification

```bash
dumplingai --version   # prints version
dumplingai status      # shows auth status
```

## Get Your API Key

Sign up and get your API key at: https://app.dumplingai.com/api-keys
