---
type: Reference
title: Code Generator (FileGenerator)
description: Core code generation engine - multi-phase pipeline that transforms AST into TypeScript code with encode/decode/compare/default/update/validate functions
tags: [architecture, code-generator, file-generator, typescript-generation]
resource: /code-generator/FileGenerator.ts
---

# Code Generator (FileGenerator)

The **FileGenerator** (`/code-generator/FileGenerator.ts`, ~88KB) is the heart of jsbuffer. It transforms parsed AST nodes into complete TypeScript output through a 4-phase pipeline.

## Class Hierarchy

```
FileGenerator extends CodeStream (from textstreamjs)
    ├── Manages indentation, code emission
    ├── Maintains per-file state
    └── Coordinates child FileGenerators for imports
```

## Constructor Options (`IFileGeneratorOptions`)

```typescript
interface IFileGeneratorOptions {
  indentationSize: number;
  textDecoder: ITextDecoder;
  typeScriptConfiguration?: Partial<ITypeScriptConfiguration> | null;
  textEncoder: ITextEncoder;
  root: FileGenerator | null;           // Parent generator (null for root)
  uniqueNamePropertyName?: string | null; // Default: '_name'
  externalModule?: boolean | null;
  compilerOptions: ICompilerOptions;    // { rootDir, outDir } - both absolute
  sortProperties?: boolean;             // Affects CRC headers
}
```

## Four-Phase Pipeline

### Phase 1: Preprocess (`#preprocess`)

**Purpose**: Resolve imports, create child generators, collect all definitions.

```typescript
async #preprocess() {
  // 1. Read and tokenize this file's source
  // 2. Generate AST
  // 3. For each node:
  //    - ImportStatement → create child FileGenerator, recurse
  //    - ExportStatement → process type/call/trait definition
  // 4. Build identifier maps and definition maps
}
```

**Key behaviors**:
- Recursively processes imported files
- Creates child `FileGenerator` for each import
- Tracks `#fileGenerators` map (path → generator)
- Tracks `#originalImports` for metadata propagation
- Validates no duplicate exports (`DuplicateExport` exception)

### Phase 2: Import Trait Dependencies (`#importTraitDependencies`)

**Purpose**: Resolve trait inheritance - copy trait members into implementing types.

```typescript
async #importTraitDependencies() {
  // For each trait this file's types implement:
  // 1. Find trait definition (local or imported)
  // 2. Copy trait parameters into implementing type
  // 3. Recursively import parent traits
}
```

### Phase 3: Update Metadata Objects (`#updateMetadataObjects`)

**Purpose**: Build `Metadata` objects for all definitions - the data model for code emission.

```typescript
#updateMetadataObjects() {
  // Iterate all AST nodes
  // For each TypeDefinition, CallDefinition, TraitDefinition:
  //   Create Metadata object with:
  //   - name, kind ('type'|'call'|'trait')
  //   - parameters with resolved types
  //   - traits implemented
  //   - CRC32 hash of definition
  //   - encoding/decoding metadata
}
```

**Metadata structure** (`/code-generator/types.ts`):
```typescript
interface Metadata {
  name: string;
  kind: 'type' | 'call' | 'trait';
  params: MetadataParam[];     // Each param has name, type, metadata
  traits: string[];            // Trait names
  crc: number;                 // CRC32 of canonical definition
  // ... encoding metadata
}
```

### Phase 4: Generate Files (`#generateFiles`)

**Purpose**: Emit TypeScript code for each definition.

```typescript
async #generateFiles(): Promise<IOutputFile[]> {
  const files: IOutputFile[] = [];
  
  // 1. Generate metadata file (for --from-metadata mode)
  // 2. For each exported definition:
  //    - Generate interface/type alias
  //    - Generate encode function
  //    - Generate decode function  
  //    - Generate compare function
  //    - Generate default function
  //    - Generate update function
  //    - Generate validate function
  // 3. Generate tsconfig.json if configured
  // 4. Return all output files
}
```

## Generated Code Per Definition

### For `type User { int id; string name; }`:

| Output | Function Name | Purpose |
|--------|---------------|---------|
| Interface | `User` | TypeScript type |
| Encode | `encodeUser(s: ISerializer, value: User)` | Write to serializer with CRC header |
| Decode | `decodeUser(d: IDeserializer): User \| null` | Read from deserializer, validate CRC |
| Compare | `compareUser(a: User, b: User): boolean` | Deep equality |
| Default | `defaultUser(params?: Partial<UserInputParams>): User` | Create with defaults |
| Update | `updateUser(value: User, changes: Partial<UserInputParams>): User` | Immutable update |
| Validate | `isUser(value: unknown): value is User` | Type guard |

### For `call GetUser : Request => Response { uint32 id; }`:

Similar but with `Call` suffix conventions and input params interface.

### For `trait Request {}`:

- Type alias: `type Request = { _name: 'schema.Request' }`
- Encode/decode trait functions
- No default/update (traits are markers)

## CRC32 Header Generation

Every encoded message starts with a **CRC32 hash** of the canonical definition:

```typescript
// In encode function:
s.writeInt32(crc32(canonicalDefinitionString));

// In decode function:
const __id = __d.readInt32();
if (__id !== expectedCrc) return null;  // Schema mismatch
```

**Canonical definition string** includes:
- Type/call name
- All parameter names and types (sorted if `--sort-properties`)
- Trait implementations
- Recursive parameter types

**Critical**: The `--sort-properties` flag changes CRC. All parties must use the same setting.

## Type Resolution System (`ResolvedType`)

Complex type expressions resolve to `ResolvedType` union (`/code-generator/types.ts`):

```typescript
type ResolvedType =
  | { fileGenerator: FileGenerator; identifier: string }  // Cross-file reference
  | INodeTypeDefinition                                     // Local type
  | INodeCallDefinition                                     // Local call
  | INodeTraitDefinition                                    // Local trait
  | { generic: GenericName }                                // Generic type param
  | { template: 'vector'|'set'; expression; type: ResolvedType }
  | { template: 'optional'; expression; type: ResolvedType }
  | { template: 'tuple'; expressions[]; types: ResolvedType[] }
  | { template: 'map'; key: {expression, resolved}; value: {expression, resolved} }
  | { template: 'bigint'; bits: INodeLiteralNumber };
```

## Template Handling

Templates are expanded recursively with specialized emitters:

| Template | Encoder | Decoder | Notes |
|----------|---------|---------|-------|
| `vector<T>` | `writeVector` | `readVector` | Length-prefixed |
| `set<T>` | `writeSet` | `readSet` | Length-prefixed, unique |
| `map<K,V>` | `writeMap` | `readMap` | Length-prefixed |
| `optional<T>` | `writeOptional` | `readOptional` | Nullable, presence byte |
| `tuple<T...>` | `writeTuple` | `readTuple` | Fixed sequence |
| `bigint<N>` | `writeBigInt` | `readBigInt` | Variable-length encoding |

## Import Management

- **Internal imports**: Relative paths between generated files
- **External imports**: From `--extends` or external modules
- **Enforcement**: `enforceLocalImport()` ensures local files use relative imports
- **Deduplication**: `#imports` Set prevents duplicate import statements

## Output File Structure

```
<outDir>/
├── tsconfig.json          # If not --no-ts-config
├── <schema-file>.ts       # Main generated file
├── <imported-file>.ts     # One per imported schema file
└── <metadata>.json        # If --from-metadata mode
```

Each generated `.ts` file contains:
1. Imports from `@jsbuffer/codec`, `textstreamjs`, local files
2. TypeScript interfaces/type aliases
3. Encode/decode/compare/default/update/validate functions
4. CRC32 constants embedded in functions

## Error Types (`/code-generator/exceptions.ts`)

| Exception | When Thrown |
|-----------|-------------|
| `ExceptionInternalError` | Internal invariant violation |
| `ASTNodePreprocessingFailure` | AST node processing failed |
| `DuplicateScopeIdentifier` | Duplicate identifier in scope |
| `TypeScriptConfigurationParsingError` | tsconfig parsing failed |
| `UnexpectedTraitOutputNodeCount` | Trait expansion produced wrong node count |
| `UnhandledResolvedType` | Type resolution fell through cases |
| `UnsupportedTypeExpression` | Unknown type in schema |
| `UnsupportedTrait` | Unknown trait name |
| `UnsupportedTemplate` | Unknown template (e.g., `unknown_template<int>`) |
| `InvalidTemplateArgumentCount` | Wrong number of template args |
| `TypeNotFound` | Referenced type doesn't exist |
| `TypeExpressionNotExported` | Type used but not exported |
| `UnsupportedGenericExpression` | Generic type parameter misuse |
| `DuplicateExport` | Same name exported twice |
| `UnhandledNode` | AST node type not handled in generation |

## Testing Integration

The test suite (`/test/FileGenerator.ts`) uses:
- **Virtual filesystem** - in-memory file trees via `helpers/generateWithVirtualFs`
- **SchemaTestCodeGenerator** - generates test code from metadata
- **Full pipeline test** - tokenize → parse → generate → compile → run tests

## Cross-References

- [Architecture Overview](/openwiki/architecture/overview.md) - Pipeline context
- [Parser & Tokenizer](/openwiki/architecture/parser.md) - AST input source
- [Generated Output](/openwiki/generated-output/overview.md) - What gets produced
- [Schema Language](/openwiki/schema-language/overview.md) - Input language
- [Source Map](/openwiki/source-map.md#code-generator-filegeneratorts) - FileGenerator source reference
- [CLI](/openwiki/architecture/cli.md) - How FileGenerator is invoked
- [Types](/openwiki/architecture/types.md) - ResolvedType, Metadata, etc.