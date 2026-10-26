---
type: Reference
title: CLI Entry Point
description: Command-line interface for jsbuffer - argument parsing, file I/O, FileGenerator orchestration
tags: [architecture, cli, entry-point]
resource: /cli/index.ts
---

# CLI Entry Point

The CLI (`/cli/index.ts`) is the user-facing entry point that orchestrates the entire code generation pipeline.

## Responsibilities

1. **Argument parsing** - Uses `cli-argument-helper` for flags and positional args
2. **File I/O** - Resolves input/output paths, validates readability/writability
3. **TypeScript config setup** - Generates or skips `tsconfig.json` in output dir
4. **FileGenerator orchestration** - Creates root FileGenerator with all options
5. **Config persistence** - Writes `jsbufferconfig.json` for test generation

## Command Structure

```bash
jsbuffer <main-source-file> [-o <output>] [options]
```

### Positional Arguments
- `<main-source-file>` - Path to main schema file (required)

### Options

| Flag | Short | Argument | Description |
|------|-------|----------|-------------|
| `--unique-name-property-name` | | string | Unique property name for generated classes/interfaces (default: `_name`) |
| `--extends` | | string | Base class/interface for generated types; adds `extends` to generated tsconfig.json |
| `--indentation-size` | | integer | Indentation size in generated code (default: 4) |
| `-o`, `--output` | | string | Output directory (default: `schema`) |
| `--no-ts-config` | | (flag) | Skip TypeScript config generation |
| `-s`, `--sort-properties` | | (flag) | Sort properties alphabetically; **changes CRC headers** |
| `-h`, `--help` | | (flag) | Show help text |

## Key Implementation Details

### Path Resolution (lines 143-144)
```typescript
mainFile = path.resolve(process.cwd(), mainFile);
outDir = path.resolve(process.cwd(), outDir);
```
Both paths are resolved relative to the **current working directory**, not the script location.

### Directory Creation (lines 148-153)
```typescript
try {
  await fs.promises.access(outDir, fs.constants.W_OK);
  assert.strict.ok((await fs.promises.stat(outDir)).isDirectory());
} catch (reason) {
  await fs.promises.mkdir(outDir);
}
```
Creates output directory if it doesn't exist; validates it's writable and a directory.

### TypeScript Config Generation (lines 163-173)
```typescript
let typeScriptConfiguration: Record<string, unknown> | null = {};
if (noTypeScriptConfig) {
  typeScriptConfiguration = null;
} else {
  if (tsExtends !== null) {
    typeScriptConfiguration = {
      ...typeScriptConfiguration,
      extends: path.relative(outDir, path.resolve(process.cwd(), tsExtends)),
    };
  }
}
```
- If `--no-ts-config`, no `tsconfig.json` is generated
- If `--extends` provided, generates `tsconfig.json` with relative `extends` path
- The `extends` path is resolved absolute but written relative to output dir

### FileGenerator Options (lines 182-196)
```typescript
const generator = new FileGenerator(
  { path: mainFile },
  {
    root: null,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
    sortProperties,
    uniqueNamePropertyName,
    compilerOptions: { outDir, rootDir: path.dirname(mainFile) },
    typeScriptConfiguration,
    indentationSize,
  }
);
```

Key options passed:
- `compilerOptions.outDir` - absolute output directory (required by FileGenerator)
- `compilerOptions.rootDir` - directory containing main schema file
- `typeScriptConfiguration` - the tsconfig object or null
- `sortProperties` - affects CRC headers (must match across all parties)
- `uniqueNamePropertyName` - defaults to `_name`

### Config Persistence (lines 198-208)
```typescript
await fs.promises.writeFile(
  path.resolve(path.dirname(mainFile), 'jsbufferconfig.json'),
  JSON.stringify(
    {
      outDir: path.relative(path.dirname(mainFile), outDir),
      mainFile: path.relative(path.dirname(mainFile), mainFile),
    },
    null,
    indentationSize
  )
);
```
Writes `jsbufferconfig.json` next to the main schema file for later test generation (used by `helpers/SchemaTestCodeGenerator`).

## Error Handling

- Missing main file → "at least one main file should be defined"
- File access errors → throws with descriptive message
- FileGenerator errors → caught and re-thrown with "Failed to generate files with error: "
- All errors → printed to stderr, process exits with code 1

## Integration Points

- **Depends on**: `FileGenerator` (code-generator), `Tokenizer`/`ASTGenerator` (src), `cli-argument-helper`, `textstreamjs`, `chalk`
- **Used by**: `npm run cli` script, direct `npx jsbuffer` execution
- **Produces**: Generated TypeScript files, `tsconfig.json` (optional), `jsbufferconfig.json`

## Cross-References

- [Architecture Overview](/openwiki/architecture/overview.md) - Pipeline context
- [Code Generator](/openwiki/architecture/code-generator.md) - FileGenerator internals
- [CLI Usage](/openwiki/workflows/cli-usage.md) - User-facing usage examples
- [Development Workflow](/openwiki/workflows/development.md) - Build/test scripts