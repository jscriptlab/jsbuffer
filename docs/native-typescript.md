# Native TypeScript backend: primitive types

This is the first VQ-1176 increment, based on the metadata contract merged by
PR #39 as `2b50a5954fe6e4b9aea59f07264a209814e481a9`.
`src/generators/typescript/FileGeneratorTypeScript.ts` accepts persisted
`IFileMetadata[]` and explicit options, and returns the shared `IGeneratedFile[]`
records. It does not read or write files. The previously excluded, unfinished
prototype is replaced by a compiling backend in the normal build and lint.
The draft's pure naming/range helper structure is reused with original 1.0.28
name spelling; its AST-dependent methods and legacy module dependency are gone.

## Supported output

Types with primitive-only parameters emit interfaces, validation, creators,
encode/decode, defaults, comparison and update functions, compact original
metadata sidecars, `__types__.ts`, and optional tsconfig output. All 15 primitive
names are represented. Declaration order, original wire names, signed CRCs,
sorting, indentation (including zero), discriminator configuration and explicit
tsconfig options come from metadata/configuration. Original serialization and
whitespace are preserved, rather than passed through a source formatter.

The original scalar fixture matches all four files (18,509 bytes total) after
the source tree is removed. The wire-name fixture also matches without any
fixture-specific rendering. Twelve additional scalar configuration cases and a
renamed/multiple/empty-declaration schema compare against fresh original output.
The full agreed corpus currently has **2 matched / 18 failed** scenarios.

Calls, traits, templates, references and schema imports/modules remain
unsupported and fail before the adapter writes output. Reserved metadata keys
`__proto__`/`__all` and generated-file path collisions fail explicitly. VQ-1176
remains In Progress; these results do not discharge its full acceptance.

## Direct differential adapter

```sh
npm run build
npm run fidelity:native -- --scenarios scalars --report /tmp/native-scalars.json
npm run fidelity:native -- --scenarios wire-names --report /tmp/native-names.json
npm run fidelity:native -- --report /tmp/native-full.json
```

The first two comparisons exit 0; the full comparison exits 1 while coverage is
incomplete. `--adapter native` selects the same preset through
`fidelity:metadata`. The adapter loads/validates metadata, maps explicit options,
calls the native backend, then writes returned records. It uses absolute script
paths internally so temporary working directories do not change dispatch.

CLI/API production integration remains VQ-1177. The default metadata comparison
still exercises the unavailable production TypeScript metadata route; it does
not automatically select the native preset. The harness's CLI metadata export
does not yet capture a custom API rootDir. The native adapter rejects a detected
root identity mismatch, preserving that visible failure until the export route
is completed.

## Source independence and verification

`test/fidelity/native.test.mjs` compares every generated regular file as raw
bytes against the verified isolated `jsbuffer@1.0.28` package. Sources are
removed before native generation. A separate fresh-process probe denies
filesystem module imports, Parser/Tokenizer/ASTGenerator, production CLI entry
points, and every legacy `code-generator` module before importing the backend.
It still generates all scalar files with diagnostic paths relocated to an
unavailable root. This is an import-boundary test, not an OS security sandbox.

The 18 native tests (including configuration subtests) join the previous 46
fidelity/contract tests. Commands, full raw comparisons, test output, compiler
diagnostics and hashes are preserved under `docs/native-typescript/2026-10-27/`.
Existing C99/C++17/Kotlin round-trip and output inventory checks remain separate.

## Original output conflicts, still unresolved

Exact output reproduces the pinned original's omissions:

- `int8`/`uint8` parameters get no encode/decode operations. Their decoder locals
  are returned without assignment.
- Generated code uses Int16/Uint16 codec methods absent from the emitted support
  interfaces.
- Generated validation still checks `_name` even when a custom discriminator
  property is emitted elsewhere.

Compiling the original and native scalar output with locked TypeScript 5.2.2,
ES2020/CommonJS, strict mode and esModuleInterop produces the same six
diagnostics: four missing support-interface methods and two unassigned locals.
The test asserts that measured conflict; it does not claim compilation passes.
The custom-discriminator behavior is preserved in the byte comparisons and
source rendering, without a runtime acceptance claim.

VQ-1178 must resolve the conflict between exact original bytes and working
generated programs explicitly. No original output, comparison normalization or
runtime acceptance rule was changed by this increment. Next VQ-1176 work expands
the renderer to templates, references/imports, traits and calls until all 20
scenarios match; VQ-1177 then integrates the production routes.
