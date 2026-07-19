---
type: Reference
title: Quick Start
description: Entry point for jsbuffer documentation - a TypeScript schema compiler that generates TypeScript interfaces with encode/decode, compare, default, and update functions
tags: [quickstart, overview, entrypoint]
resource: /README.md
---

# jsbuffer Quick Start

jsbuffer is a **TypeScript schema compiler** that parses a custom schema language (`.jsbuffer` files) and generates TypeScript code including:
- **TypeScript interfaces** for your data types
- **Encode/decode functions** for binary serialization via `@jsbuffer/codec`
- **Comparison functions** for deep equality checks
- **Default value functions** for initializing objects
- **Update functions** for immutable updates with structural sharing

## Quick Example

Create a schema file `schema/main.jsbuffer`:

```jsbuffer
type User {
  int id;
  string name;
  optional<string> email;
  vector<int> tags;
}
```

Compile it:

```bash
npx jsbuffer schema/main.jsbuffer -o src/generated
```

This generates TypeScript files in `src/generated/` with interfaces and codec functions ready to use with `@jsbuffer/codec`.

## Documentation Structure

### 🏗️ Architecture
- [Architecture Overview](/openwiki/architecture/overview.md) - High-level data flow and component relationships
- [CLI Entry Point](/openwiki/architecture/cli.md) - Command-line interface, argument parsing, file generation flow
- [Parser & Tokenizer](/openwiki/architecture/parser.md) - Lexical analysis and AST generation from schema source
- [Code Generator](/openwiki/architecture/code-generator.md) - Core FileGenerator, code generation phases, output files

### 📝 Schema Language
- [Schema Language Overview](/openwiki/schema-language/overview.md) - Syntax, keywords, file structure
- [Types & Templates](/openwiki/schema-language/types.md) - Built-in types, templates (vector, set, map, optional, tuple, bigint)
- [Calls & Traits](/openwiki/schema-language/calls-traits.md) - RPC-style calls, trait definitions, imports/exports
- [Imports & Exports](/openwiki/schema-language/imports.md) - Sharing definitions across schema files

### ⚙️ Generated Output
- [Generated Output Overview](/openwiki/generated-output/overview.md) - Interfaces, encode/decode, compare, default, update functions

### 🛠️ Development Workflows
- [CLI Usage](/openwiki/workflows/cli-usage.md) - All CLI options, examples, configuration

## Quick Links

| Task | Go To |
|------|-------|
| Install & run CLI | [CLI Usage](/openwiki/workflows/cli-usage.md) |
| Write schema files | [Schema Language Overview](/openwiki/schema-language/overview.md) |
| Understand generated code | [Generated Output Overview](/openwiki/generated-output/overview.md) |
| Share definitions across files | [Imports & Exports](/openwiki/schema-language/imports.md) |

## Key Concepts

### Schema Language
The schema language defines **types**, **calls** (RPC-style request/response), and **traits** (polymorphic types). It supports:
- Primitive types: `int`, `int8`, `int16`, `int32`, `long`, `uint`, `uint8`, `uint16`, `uint32`, `ulong`, `float`, `double`, `bool`, `string`, `bytes`
- Templates: `vector<T>`, `set<T>`, `map<K,V>`, `optional<T>`, `tuple<T...>`, `bigint<N>`
- User-defined types, calls, and traits with imports/exports

### Code Generation Pipeline
```
Schema File (.jsbuffer)
        ↓
   Tokenizer (src/Tokenizer.ts)
        ↓
   AST Generator (src/ASTGenerator.ts)
        ↓
   FileGenerator (code-generator/FileGenerator.ts)
        ├─→ Preprocess (resolve imports, traits, dependencies)
        ├─→ Import trait dependencies
        ├─→ Update metadata objects
        └─→ Generate TypeScript files
                ├─→ Interfaces
                ├─→ Encode functions
                ├─→ Decode functions
                ├─→ Compare functions
                ├─→ Default functions
                ├─→ Update functions
                └─→ Validation functions
        ↓
   TypeScript Compilation (tsc)
        ↓
   Runtime: @jsbuffer/codec Serializer/Deserializer
```

### CRC Headers
Every generated type and call gets a **CRC32 header** written during encoding and verified during decoding. This ensures schema compatibility across services. The `--sort-properties` flag affects CRC values.

## Next Steps

1. **Read the [CLI Usage](/openwiki/workflows/cli-usage.md)** guide for all command-line options
2. **Study the [Schema Language](/openwiki/schema-language/overview.md)** to write your own schemas
3. **Explore [Generated Output](/openwiki/generated-output/overview.md)** to understand what code gets produced

## Repository Context

This documentation was generated from the `jsbuffer` repository at commit `ea12a59` (v1.0.28). The codebase is a monorepo-style TypeScript project with:
- `/src` - Parser/tokenizer (TypeScript)
- `/code-generator` - Core code generation (TypeScript, ~88KB main file)
- `/cli` - Command-line entry point
- `/test` - Test suites with virtual filesystem testing
- `/helpers` - Test utilities including virtual FS schema compilation
- `/out` - Generated output from test schemas (committed for reference)