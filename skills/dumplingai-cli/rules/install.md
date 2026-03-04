# Installation Guide

## Quick Start (no install required)

```bash
npx -y @dumplingai/cli init
```

This runs the CLI directly via npx and walks you through authentication.

## Global Install

```bash
# npm
npm install -g @dumplingai/cli

# pnpm
pnpm add -g @dumplingai/cli

# yarn
yarn global add @dumplingai/cli
```

Then authenticate:

```bash
dumplingai login --api-key sk_yourkey
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

Sign up and get your API key at: https://app.dumplingai.com/settings/api-keys
