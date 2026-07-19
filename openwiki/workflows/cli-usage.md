---
type: Reference
title: CLI Usage Workflow
description: Common command-line workflows for jsbuffer - compiling schemas, development iteration, testing, and CI integration
tags: [workflows, cli, usage, development, ci]
resource: /cli/index.ts
---

# CLI Usage Workflow

Complete guide to using the `jsbuffer` CLI for schema compilation and development.

## Basic Compilation

```bash
# Compile main schema to output directory
npx jsbuffer schema/main.jsbuffer -o dist/schema

# With custom output directory
npx jsbuffer schema/api.jsbuffer -o ./generated

# Skip TypeScript config generation
npx jsbuffer schema/main.jsbuffer -o out --no-ts-config
```

## Extended TypeScript Configuration

```bash
# Extend a base tsconfig (e.g., shared config from monorepo)
npx jsbuffer schema/main.jsbuffer -o out --extends tsconfig.base.json

# The extends path is resolved from CWD, written as relative to output dir
```

## Property Sorting (CRC-Affecting)

```bash
# Sort properties alphabetically - CHANGES CRC HEADERS
npx jsbuffer schema/main.jsbuffer -o out --sort-properties

# ⚠️ All parties encoding/decoding must use the SAME setting
```

## Custom Unique Name Property

```bash
# Change the discriminant property name (default: _name)
npx jsbuffer schema/main.jsbuffer -o out --unique-name-property-name _type

# Useful for compatibility with other code generators
```

## Indentation Size

```bash
# 2-space indentation (default is 4)
npx jsbuffer schema/main.jsbuffer -o out --indentation-size 2
```

## Help

```bash
npx jsbuffer --help
npx jsbuffer -h
```

## Development Workflow

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Create schema file
cat > schema/main.jsbuffer << 'EOF'
type User {
  int id;
  string name;
}
EOF

# First compilation
npm run build:all
# Or manually:
npx jsbuffer schema/main.jsbuffer -o schema/out
```

### 2. Iterative Development

```bash
# Watch mode not built-in; use nodemon or similar:
npx nodemon --watch schema --ext jsbuffer --exec "npx jsbuffer schema/main.jsbuffer -o schema/out"

# Or simple loop:
while true; do npx jsbuffer schema/main.jsbuffer -o schema/out; sleep 2; done
```

### 3. Testing Generated Code

```bash
# Run tests (compiles TypeScript first)
npm test

# With coverage
npm run test:coverage
```

### 4. Pre-commit / CI

```bash
# Full build pipeline (schema → compile → lint → test)
npm run build:all

# In CI:
# - npm ci
# - npm run build:all
# - npm test
```

## NPM Scripts Reference (from package.json)

| Script | Command | Purpose |
|--------|---------|---------|
| `lint:eslint` | `eslint --fix src code-generator` | Lint source |
| `lint:prettier` | `prettier --write "out/**/*.ts" "src/**/*.ts" "code-generator/**/*.ts"` | Format generated + source |
| `lint` | `lint:eslint && lint:prettier` | Full lint |
| `cli` | `ts-node --project cli/tsconfig.json cli` | Run CLI from source |
| `schema` | `cli test/schema -o out --extends tsconfig.base.json --indentation-size 2` | Generate test schema |
| `build` | `tsc -b out cli code-generator src --force` | Compile TypeScript |
| `build:all` | `schema && build && lint` | Full pipeline |
| `test` | `sarg --bail --require ts-node/register "test/**/*.ts"` | Run tests |
| `test:coverage` | `nyc npm test` | Coverage report |
| `prepublishOnly` | `build:all && test` | Pre-publish validation |

## Common Patterns

### Pattern: Monorepo Shared Schema

```bash
# In shared-schema package
npx jsbuffer schema/api.jsbuffer -o dist --extends ../../tsconfig.base.json
npm publish

# In consumer package
npm install shared-schema
# Import generated types from shared-schema/dist
```

### Pattern: Multi-Schema Project

```bash
# Each service has its own schema
npx jsbuffer services/auth/schema/main.jsbuffer -o services/auth/generated
npx jsbuffer services/api/schema/main.jsbuffer -o services/api/generated
npx jsbuffer services/payments/schema/main.jsbuffer -o services/payments/generated
```

### Pattern: Versioned Schemas

```bash
npx jsbuffer v1/schema.jsbuffer -o dist/v1
npx jsbuffer v2/schema.jsbuffer -o dist/v2
# Consumers import from specific version
```

### Pattern: Generate from Metadata (Advanced)

```bash
# If you have metadata JSON from previous generation
npx jsbuffer --from-metadata metadata.json -o out
```

## Troubleshooting

### "at least one main file should be defined"
```bash
# Forgot the positional argument
npx jsbuffer -o out
# Fix:
npx jsbuffer schema/main.jsbuffer -o out
```

### "Failed to generate files with error: TypeNotFound"
- Check imports/exports in schema files
- Ensure referenced types are `export`ed
- Verify import paths are correct (relative to importing file)

### CRC Mismatch at Runtime
- Ensure `--sort-properties` is consistent across all parties
- Schema hasn't changed without recompilation
- Same jsbuffer version on all sides

### "The specified `outDir` is not a directory"
- Output parent directory must exist
- CLI creates the final directory but not parents

### TypeScript Compilation Errors in Generated Code
- Check `--extends` path is correct
- Ensure `@jsbuffer/codec` is installed
- Run `npm run build:all` to regenerate + compile

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:all
      - run: npm test
```

### Pre-commit Hook (husky)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint"
    }
  }
}
```

## Cross-References

- [CLI Architecture](/openwiki/architecture/cli.md) - Internal implementation
- [Schema Language](/openwiki/schema-language/overview.md) - Input syntax
- [Generated Output](/openwiki/generated-output/overview.md) - What gets produced
- [Development Workflow](/openwiki/workflows/development.md) - Full dev loop
- [Testing Guide](/openwiki/workflows/testing.md) - Test strategies