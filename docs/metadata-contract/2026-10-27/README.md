# VQ-36 / VQ-1175 verification, 2026-10-27

Source implementation/audit: `dc2d6366c4c8d6b3a2a9ebf6d4a92d2385cd1856`.
Final source after lint-only fixes: `895be18b98a2b4cf8991192e346edb5d91f67c45`.
Base: `a466a392b5361a40d6d514a50fdf02b67590142f` (`develop`).
[PR #39](https://github.com/jscriptlab/jsbuffer/pull/39) targets that branch.
See [the contract/dependency map](../../metadata-contract.md) and
[draft reuse audit](draft-reuse-audit.md).

PR #37 merged as `6a48725a01cd9f1d47bc16609c97e9b45986a306`.
PR #38 merged as `a466a392b5361a40d6d514a50fdf02b67590142f` after refreshed
build, harness and Node-20 test checks passed. Its optional notification job was
skipped. These integrations did not publish a package or merge into master.

## Executed checks

Build/harness/consumer checks used Node **20.17.0**, npm **10.8.2**, and locked
TypeScript **5.2.2** on macOS arm64. No dependencies or package locks changed.
The oracle is the unchanged pinned `jsbuffer@1.0.28` package, gitHead
`b4089d8a86a71a11507756ecb48838487e546033`, with its verified baseline runtime
lock, including textstreamjs 0.0.4.

| Command or comparison | Observed result |
| --- | --- |
| `npm run build` | Passed; normal project targets, still excluding the unfinished TypeScript backend |
| `npx eslint src/parser/Parser.ts src/parser/metadataContract.ts` | Passed after correcting a loop-rule error and a prefer-const error |
| `npm run test:fidelity` | 46 passed, 0 failed, 0 skipped; includes 20 source-removed contract cases and the original harness tests |
| `npx ava test/parser/Parser.js test/fromMetadata.js test/kotlin.js` | 7 passed; frozen consumer metadata and C99/C++17/Kotlin round trips |
| Native consumer output before/after this change | 63 regular files unchanged: C99 24, C++17 13, Kotlin 26; no missing/extra/changed files |
| `npm run fidelity:metadata -- --report <report.json>` | Exit 1, as required: all 20 export successfully, all 20 fail at TypeScript generation (17 unsupported native CLI, 3 unsupported programmatic adapter) |

The initial Linux fidelity job also passed. The first Linux build job found the
loop lint error; the source fix above addresses it. Current PR checks are the
authoritative final-head CI result, rather than the historical first run.

The 20 contract cases verify ordinary JSON export/reload after deleting the
temporary source tree, including package schemas/configs. Original sidecars
provide exact names, signed IDs and declaration/member order. Both sorting
choices are reconstructed from either exported order without reading schema
files. The API `rootDir` case uses a programmatic export because that input is
not currently exposed by the metadata CLI. Other cases exercise CLI export too.
Malformed identities, CRCs, nested types, missing call returns/dependencies,
compiled module paths, reference targets and manifest order fail validation.

## Native comparison provenance

The before inventories were captured from the pre-change integration tree,
which is byte-identical to base `a466a39`, using host Node **26.12.1**. Final
generation with Node **20.17.0** produced exactly those same raw bytes. This is
the observed comparison; it is not a general claim of support for Node 26.

The comparison reads every generated file as a Buffer. It stores sizes and
SHA-256 hashes for both sides and reports missing/extra/changed bytes in
`native-output-comparison.json`. Reproduce these commands in before/after
checkouts, with the same output-directory depth:

```sh
node cli/jsb.js src/generators/c/test/app.jsb --generator c99 --name app -o .audit-vq38/metadata-contract-node20/c99
node cli/jsb.js test/parser/test_schema.jsb --generator cpp17 --name app -o .audit-vq38/metadata-contract-node20/cpp17
node cli/jsb.js test/kotlin/src/main --generator kotlin --name com.test.app.schema -o .audit-vq38/metadata-contract-node20/kotlin
```

## Preserved evidence and limits

`manifest.json` hashes the four raw evidence files. `contract-fidelity.tap` and
`consumer-tests.txt` retain test output; `metadata-generation.json.gz` preserves
the full failing TypeScript comparison report at the final source SHA. Its
temporary paths are run provenance, not persistent dependencies.

Generation tests do not establish local C/AVR compilation or Kotlin runtime
behavior. The full native job runs in Linux CI. Original TypeScript raw-byte,
runtime/wire, native-architecture and clean-package-consumer acceptance remain
VQ-1176 through VQ-1178 and later release gates. The new contract never falls
back to legacy generation, embeds no source blob, and does not publish anything.
