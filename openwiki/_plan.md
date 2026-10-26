---
type: Reference
title: Documentation Plan
description: Plan for jsbuffer OpenWiki documentation structure
tags: [planning, internal]
---

# jsbuffer Documentation Plan

## Repository Overview
jsbuffer is a TypeScript code generator that parses a custom schema language and generates TypeScript interfaces with encode/decode functions, comparison functions, default value functions, and update functions. It includes a CLI tool for schema compilation.

## Major Domains Identified

1. **CLI Entry Point** (`/cli/index.ts`) - Command-line interface, argument parsing, file I/O
2. **Parser/Tokenizer** (`/src/Tokenizer.ts`, `/src/ASTGenerator.ts`) - Lexical analysis and AST generation
3. **Code Generator** (`/code-generator/FileGenerator.ts` - 88KB) - Core code generation logic
4. **Schema Language** - Custom type language with types, calls, traits, templates
5. **Generated Output** - TypeScript interfaces, encode/decode functions, compare/default/update functions
6. **Testing Infrastructure** (`/test/`, `/helpers/`) - Virtual FS testing, schema test generation
6. **Dependencies** - `@jsbuffer/codec` for serialization, various utility libraries

## Documentation Pages to Create

### Entry Point
- `/openwiki/quickstart.md` - Main entry point with overview, quick start, links to all sections

### Section Pages

#### Architecture
- `/openwiki/architecture/overview.md` - High-level architecture, data flow, component relationships
- `/openwiki/architecture/cli.md` - CLI entry point, argument parsing, file generation flow
- `/openwiki/architecture/parser.md` - Tokenizer and AST generator
- `/openwiki/architecture/code-generator.md` - FileGenerator core, code generation phases

#### Schema Language
- `/openwiki/schema-language/overview.md` - Schema language overview, syntax, types
- `/openwiki/schema-language/types.md` - Type definitions, built-in types, templates
- `/openwiki/schema-language/calls-traits.md` - Call definitions, trait definitions, imports/exports
- `/openwiki/schema-language/examples.md` - Schema examples from test files

#### Generated Output
- `/openwiki/generated-output/overview.md` - What gets generated (interfaces, encode/decode, compare, default, update)
- `/openwiki/generated-output/codec-integration.md` - Integration with @jsbuffer/codec
- `/openwiki/generated-output/crc-headers.md` - CRC headers for type/call identification

#### Development Workflows
- `/openwiki/workflows/development.md` - Build, test, lint commands
- `/openwiki/workflows/cli-usage.md` - CLI usage examples from README
- `/openwiki/workflows/testing.md` - Test infrastructure, virtual FS, schema test generation

#### Source Map
- `/openwiki/source-map.md` - File-by-file source map with key functions/classes

#### Operations
- `/openwiki/operations/release.md` - Version history, release process (from git history)
- `/openwiki/operations/dependencies.md` - Key dependencies and their roles

## Cross-Link Relationships (for OKF compliance)

1. `quickstart.md` → links to ALL major section pages
2. `architecture/overview.md` → links to cli.md, parser.md, code-generator.md
3. `architecture/cli.md` → links to cli/index.ts, code-generator/FileGenerator.ts
4. `architecture/parser.md` → links to src/Tokenizer.ts, src/ASTGenerator.ts
4. `architecture/code-generator.md` → links to code-generator/FileGenerator.ts, code-generator/types.ts
5. `schema-language/overview.md` → links to types.md, calls-traits.md, examples.md
6. `schema-language/types.md` → links to generated-output/overview.md (encode/decode functions)
7. `schema-language/calls-traits.md` → links to generated-output/overview.md (call/trait codegen)
8. `generated-output/overview.md` → links to codec-integration.md, crc-headers.md
9. `workflows/development.md` → links to package.json scripts, test files
10. `source-map.md` → links to all major source files

## Backlog Items (to document if time permits)
- Kotlin generator (in recent git history, separate branch)
- C/C++ generators (referenced in git history)
- Metadata-only generation mode (`--from-metadata`)
- External schema imports and cascading
- Test coverage and nyc integration