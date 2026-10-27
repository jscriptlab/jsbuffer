# Metadata contract for original TypeScript generation

`Parser.parse()` now adds an optional, versioned `contract` to each
`IFileMetadata`. It contains resolved semantics and original presentation
identities. It contains no schema source, serialized AST, or reparse instruction.
The existing `metadata` array remains the payload used by C99, C++17, and Kotlin.

The compatibility target is the acquired `jsbuffer@1.0.28` artifact, source
`b4089d8a86a71a11507756ecb48838487e546033`. Its runtime pins and file hashes are
recorded in [the frozen baseline](release-baseline/2026-10-26). Later 1.x naming
changes are not the target. This contract is preparation for VQ-1176; it does not
implement a TypeScript renderer or pass the TypeScript release gate.

## Dependency map

| Original output dependency | Persisted field or explicit input |
| --- | --- |
| Declaration names, kinds, source order, visibility | `metadata[]`, `name`, `kind`, `exported`; aligned `contract.declarations[]`, `contract.exports` |
| Original wire discriminator, including camel case, underscores and `.jsb` | `contract.declarations[].globalName`; `originalGlobalName` lowercases only the first character of each path segment and preserves the extension |
| Helper/interface/creator names and reserved identifiers | Raw declaration/parameter names and kinds, resolved import identifiers and ordering; the profile's naming/allocation algorithm is a backend implementation input |
| Wire/header CRC | `crcInput` and signed `id`, checked against a canonical reconstruction from logical path, name, ordered parameter types, and readonly call return type |
| Source and emitted member order | `sourceParamOrder` plus `metadata[].params` and `contract.sortProperties`; `originalTypeScriptDeclaration` can select either order without source access |
| Primitive types and template arguments | Existing recursive `MetadataParamType`: all 15 generics, optional/vector/set/map/tuple/bigint, with argument order and integer width |
| Calls and trait membership/variant order | Existing `returnType`, `traits`, and trait `nodes[]`; references resolve to declarations in the file graph |
| Source imports and package configuration | `contract.imports[]` in statement order: original specifier, required identifiers (or wildcard), target logical file, compiled import path |
| Resolved identity of every type reference | `contract.references[]`: JSON pointer into `metadata`, target logical file, declaration name; includes nested templates, traits and returns |
| Module/output paths without schema access | `logicalPath`, `entryPoint`, `fileOrder`, `outputPath`, and optional `module` root/outDir/compiled import identity |
| File generation order and aggregate output | Ordered metadata manifest restores parser order: entry first, then registered dependencies. Original TypeScript emission visits dependencies in that order, then entry, omitting external modules |
| Source comments | Original line comments are discarded; a raw-tree comparison with comments removed confirms no emitted dependency. Original block comments remain an unsupported-input fixture |
| Generated comments | Derived by the backend from names, params and fixed profile templates (e.g. encoding/decoding parameter comments); no source comment text is required |
| Runtime support code and original metadata sidecar representation | Fixed templates and serialization rules of the pinned profile. Sidecars must project original fields; original trait sidecars omit `globalName` and `id` |
| Indentation, discriminator property and sorting | Explicit `IMetadataTypeScriptOptions`: original defaults are 4 spaces, `_name`, and unsorted. Zero indentation remains meaningful |
| `tsconfig.json` and API/CLI option precedence | Explicit `typeScriptConfiguration` object, `{}` default, `null` to omit; caller resolves CLI `--extends` relative to the output directory. Preserve original merge/order rules in the backend |
| API `rootDir` and output location | Root is resolved during initial parsing and reflected in logical paths/CRCs; output directory is an explicit generation input. Neither is rediscovered during reload |

Imports do not acquire new alias syntax. The existing grammar carries identifier
requirements or wildcard requirements; the contract preserves those semantics.
Package schemas are resolved through the closest `node_modules` and their
`jsbufferconfig.json`, including scoped packages. External schemas participate in
resolution but their TypeScript source is not emitted into the consumer output.
The original schema-root restriction is retained.

## Reading, writing, and compatibility

`contract.version` is `1` and `contract.profile` is `jsbuffer@1.0.28`. A future
incompatible contract/profile needs an explicit reader change. Unknown versions
are rejected. All paths in the contract use `/`, independently of diagnostic
`IFileMetadata.path` and token offsets. Diagnostic paths may be relocated without
changing logical identity; reload never reads those paths.

Validate the complete list with `validateMetadataGraph(files,
{requireContract: true})` before persistence or native TypeScript generation.
`serializeFileMetadata` validates a single file and writes ordinary JSON without
sorting arrays. The CLI writes an ordered `metadata.index.json` manifest and
honors sorting during metadata export. JSON round trips preserve integers,
literal width strings and all semantic array orders. Keep the ordered manifest
with the files; alphabetical directory fallback is only sufficient when it also
preserves the contract's file order.

`loadFileMetadataList` validates new contracts automatically, including nested
types, required call/trait data, identity/CRC/order consistency, module paths,
imports, reference locations and target exports. Missing graph files, mixed
contract/legacy lists, duplicate files/references, reordered manifests, and
escaping manifest paths fail. A native TypeScript caller must request
`requireContract: true`, so absent data cannot silently fall back to legacy
generation. Existing unversioned `{path, metadata}` dumps keep their established
minimal validation for existing consumers; they do not prove TypeScript
completeness. Re-export them to obtain a contract.

`originalTypeScriptDeclaration` returns a view with original wire name and
selected parameter order/CRC, leaving the shared consumer payload unchanged.
Its omitted sorting option selects the original unsorted default, even for a
sorted export. Formatting and tsconfig options stay explicit inputs rather than
being inferred from source locations. CLI/API integration of those inputs is
VQ-1177, including the existing programmatic-root harness adapter limitation.

## Verification and remaining acceptance

`npm run build` and `npm run test:fidelity` exercise the contract. The contract
suite exports all 20 reference cases, deletes the temporary schema/package tree,
then reloads and validates the persisted graph. Original sidecars establish
declaration/member order, discriminator spelling, and signed CRCs. Both sorting
choices can be reconstructed from either persisted order. Package output
identity and malformed/missing metadata have negative tests.

Existing parser and C99/C++17/Kotlin round-trip tests remain separate. Frozen
before/after native-output inventories and exact test evidence are under
`docs/metadata-contract/2026-10-27/`. These are generation tests, not native
compiler or Kotlin runtime acceptance. The TypeScript metadata comparison still
fails at generation for every case until VQ-1176/1177. VQ-1178 independently
accepts complete TypeScript raw bytes, runtime/wire behavior, and native
architecture; a contract round trip does not discharge those gates.
