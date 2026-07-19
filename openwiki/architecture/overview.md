---
type: Reference
title: Architecture Overview
description: High-level architecture of jsbuffer - data flow from schema files through tokenizer, AST generator, and code generator to TypeScript output
tags: [architecture, overview, data-flow]
resource: /src/index.ts
---

# Architecture Overview

jsbuffer follows a **pipeline architecture** that transforms schema source files into generated TypeScript code. The pipeline has four main stages:

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│  Schema Files   │────▶│  Tokenizer   │────▶│  AST Generator  │────▶│   FileGenerator    │
│  (.jsbuffer)    │     │  (Tokenizer) │     │  (ASTGenerator) │     │   (FileGenerator)  │
└─────────────────┘     └──────────────┘     └─────────────────┘     └──────────────────────┘
                                                                         │
                                                                         ▼
                                                              ┌──────────────────────┐
                                                              │  Generated TypeScript │
                                                              │  - Interfaces         │
                                                              │  - Encode/Decode      │
                                                              │  - Compare/Default/   │
                                                              │    Update/Validate    │
                                                              │  - tsconfig.json      │
                                                              └──────────────────────┘
                                                                         │
                                                                         ▼
                                                              ┌──────────────────────┐
                                                              │  TypeScript Compiler │
                                                              │      (tsc)           │
                                                              └──────────────────────┘
                                                                         │
                                                                         ▼
                                                              ┌──────────────────────┐
                                                              │  Runtime: @jsbuffer/ │
                                                              │  codec Serializer/    │
                                                              │  Deserializer/Codec   │
                                                              └──────────────────────┘
```

## Component Relationships

| Component | Location | Responsibility | Depends On |
|-----------|----------|----------------|------------|
| **Tokenizer** | `/src/Tokenizer.ts` | Lexical analysis - converts source text to tokens | `/src/Character.ts` |
| **ASTGenerator** | `/src/ASTGenerator.ts` | Parses tokens into Abstract Syntax Tree | Tokenizer, `/src/ASTGenerator.ts` (self) |
| **FileGenerator** | `/code-generator/FileGenerator.ts` | Core code generation - multi-phase pipeline | ASTGenerator output, `/code-generator/types.ts`, `/code-generator/fileGeneratorUtilities.ts` |
| **CLI** | `/cli/index.ts` | Entry point, argument parsing, file I/O, orchestrates pipeline | FileGenerator, Tokenizer, ASTGenerator |

## Data Flow Details

### 1. Tokenization (`/src/Tokenizer.ts`)
- Input: Raw schema file contents as `Uint8Array`
- Output: Array of `IToken` (keywords, identifiers, literals, punctuators) + comments
- Keywords: `call`, `from`, `trait`, `import`, `type`, `export`
- Uses `Character` utility class for character classification

### 2. AST Generation (`/src/ASTGenerator.ts`)
- Input: Token array from Tokenizer
- Output: Array of `ASTGeneratorOutputNode` (export statements, type/call/trait definitions, imports)
- Node types: `TypeDefinition`, `CallDefinition`, `TraitDefinition`, `ImportStatement`, `ExportStatement`
- Single-pass recursive descent parser with lookahead

### 3. Code Generation (`/code-generator/FileGenerator.ts`) - **Core Component (~88KB)**
The FileGenerator runs a **4-phase pipeline**:

1. **Preprocess** (`#preprocess`): 
   - Recursively processes imports
   - Creates child FileGenerators for each imported file
   - Resolves type references across files
   - Builds metadata objects for all definitions

2. **Import Trait Dependencies** (`#importTraitDependencies`):
   - Resolves trait inheritance chains
   - Imports trait members into implementing types

3. **Update Metadata Objects** (`#updateMetadataObjects`):
   - Collects metadata for all type/call/trait definitions
   - Prepares data for code emission

4. **Generate Files** (`#generateFiles`):
   - Emits TypeScript code for each definition
   - Produces interfaces, encode/decode, compare, default, update, validate functions
   - Generates `tsconfig.json` if not disabled

### 4. Generated Output
Each exported definition produces:
- **TypeScript interface** (for types/calls) or **type alias** (for traits)
- **Encode function** - writes to `ISerializer` with CRC32 header
- **Decode function** - reads from `IDeserializer`, validates CRC header
- **Compare function** - deep equality check
- **Default function** - creates instance with default values
- **Update function** - immutable update with structural sharing
- **Validate function** - type guard / validation

### 5. Runtime Integration (`@jsbuffer/codec`)
Generated code uses interfaces from `@jsbuffer/codec`:
- `ISerializer` - `writeInt32`, `writeString`, `writeBytes`, etc.
- `IDeserializer` - `readInt32`, `readString`, `readBytes`, etc.
- `Codec` - combined encode/decode convenience class
- CRC32 headers ensure wire compatibility

## Key Design Decisions

### Single-Pass Tokenizer + Recursive Descent Parser
The tokenizer produces all tokens upfront, then the AST generator consumes them in a single pass with lookahead. This simplifies error handling (position tracking via tokens) but requires full tokenization before parsing.

### FileGenerator as Central Coordinator
FileGenerator extends `CodeStream` (from `textstreamjs`) for indentation-managed code generation. It acts as both:
- **Per-file generator** - each schema file gets a FileGenerator instance
- **Root coordinator** - the root FileGenerator manages child generators for imports

### Metadata-Driven Code Generation
All code generation is driven by `Metadata` objects collected during preprocessing. This separates analysis (what to generate) from emission (how to generate TypeScript).

### CRC32 for Schema Versioning
Every encoded message starts with a CRC32 hash of the type/call definition. This enables:
- Decoder validation (reject mismatched schemas)
- Cross-language compatibility
- The `--sort-properties` flag affects CRC - must be consistent across all parties

## Cross-References

- [CLI Entry Point](/openwiki/architecture/cli.md) - How the pipeline is invoked
- [Parser & Tokenizer](/openwiki/architecture/parser.md) - Detailed tokenizer/AST logic
- [Code Generator](/openwiki/architecture/code-generator.md) - FileGenerator internals
- [Schema Language](/openwiki/schema-language/overview.md) - Input language specification
- [Generated Output](/openwiki/generated-output/overview.md) - What the pipeline produces
- [Source Map](/openwiki/source-map.md) - File-by-file source reference