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

The scalar fixture matches all four files against the corrected original
reference after the source tree is removed. The wire-name fixture also matches without any
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

The native tests and default 16-bit compilation/runtime regressions join the
existing fidelity/contract tests. The current suite has 65 passing tests. The
first increment's historical results are under `docs/native-typescript/2026-10-27/`;
the subsequent default declaration fix is recorded under `docs/int16-support-types/2026-10-27/`.
Existing C99/C++17/Kotlin round-trip and output inventory checks remain separate.

## Default 16-bit declaration fix and remaining original conflicts

The user approved fixing the missing 16-bit interface declarations upstream.
Both the original FileGenerator and this backend now always emit readInt16,
readUint16, writeInt16 and writeUint16. No compatibility option is required.
Generated 16-bit consumers compile with strict TypeScript and run against the
real codec through both public schema routes and the metadata route.

Active comparisons use `jsbuffer@1.0.28+int16-interfaces.1`: a verified copy of
the original generator with exactly those four declarations added. Reports
include original/corrected source hashes and the correction script hash. The
published archive, its 74-file inventory and frozen original outputs remain
unchanged; `--reference-profile published` selects that historical control.
Comparisons read raw bytes after the corrected reference generates output.

The previous expected-compilation-failure test was removed. Its six-diagnostic
JSON is historical evidence at source 42f56da, superseded for the four 16-bit
method errors by this fix. Current 16-bit regression tests require zero
diagnostics. Separate original defects remain under VQ-1178:

- `int8`/`uint8` parameters get no encode/decode operations. Their decoder locals
  are returned without assignment.
- Generated validation still checks `_name` even when a custom discriminator
  property is emitted elsewhere.

These independent 8-bit/custom-discriminator issues still need an explicit
decision; the 16-bit declaration issue is resolved by the approved default fix.
Next VQ-1176 work expands
the renderer to templates, references/imports, traits and calls until all 20
scenarios match; VQ-1177 then integrates the production routes.
