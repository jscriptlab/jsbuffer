# JSBuffer original output comparison

This harness compares the complete generated output of the pinned original `jsbuffer@1.0.28` with a candidate. Every generated file is read as bytes. Missing files, extra files, changed bytes, generation failures and timeouts fail the comparison.

## Commands

Use the project's `.nvmrc` Node version and build the candidate first:

```sh
npm ci
npm run build
npm run test:fidelity
```

`test:fidelity` checks the comparator, command/report exit statuses, isolated original fixture, and metadata-adapter plumbing. It does not certify production TypeScript parity. The `Fidelity harness / harness` CI job runs these checks independently of the native compiler suite.

```sh
# Verify the package and install its exact isolated runtime lock.
npm run fidelity:setup

# Confirm that the original oracle reproduces itself for every scenario.
npm run fidelity:compare -- --mode oracle --report .cache/fidelity-reports/oracle.json

# Measure current legacy output against original 1.0.28.
npm run fidelity:compare -- --report .cache/fidelity-reports/legacy.json

# Exercise native TypeScript generation from persisted metadata.
npm run fidelity:metadata -- --report .cache/fidelity-reports/metadata.json
```

Exit 0 means all selected scenarios matched. Exit 1 means a mismatch, generation failure, timeout, or invalid invocation. An unavailable metadata backend produces a failure report; it never falls back to legacy source generation. A successful command that produces no valid reference output cannot pass.

Use `node tools/fidelity/cli.mjs list` to list scenarios or `--scenarios default,wire-names` to select a subset. Reports identify generated paths, sizes, SHA-256 hashes, the first differing byte and nearby hexadecimal bytes, along with actual commands, stderr, the candidate Git SHA, and input/configuration identities. No output text or whitespace is normalized.

## Original fixture and coverage

The immutable package identity, source commit, seven runtime version pins, package lock and 11 original schema inputs come from [VQ-38's frozen evidence](../../docs/release-baseline/2026-10-26/README.md). Setup verifies the tarball SHA-512 and SHA-256, runs `npm ci --ignore-scripts` in an isolated cache, and verifies all 74 original package files. npm's nested runtime dependencies are governed by the exact lock; they are separate from the published jsbuffer file inventory. No original generator is imported into production code or added to production dependencies.

The 20 successful original scenarios cover:

| Area | Cases |
| --- | --- |
| Defaults and formatting | Original default, indentation 0/2/8, preserved line comments, naming and `.jsb` paths |
| Configuration | Long/short sort flags, custom unique-name property, disabled tsconfig, same/parent/sibling extends paths |
| Programmatic API | Inline compiler configuration, no config, explicit root directory |
| Schema features | All 15 recognized primitives, bigint literals, nested vector/set/map/optional/tuple, types, traits, call returns, local and transitive imports |
| Package imports | Plain and scoped package schemas, sorted external schema configuration |
| Generated output | Every `.ts`, metadata sidecar, helper and tsconfig emitted into the output directory, including CRC/header values |

The fresh default oracle output must also match VQ-38's frozen 24-file output. The original CLI's adjacent `jsbufferconfig.json` side effect is outside the generated output directory; CLI compatibility for it remains VQ-1177. Compilation/runtime and wire fixtures remain independent VQ-1178/VQ-1181 acceptance gates.

Two additional negative tests preserve observed original behavior: C-style block comments are rejected, and external package schemas outside the configured schema root fail. Successful package fixtures therefore place their node_modules below that root. These are explicit original constraints, not changes to the oracle or waived output mismatches.

## Metadata candidate integration

The metadata path exports persisted metadata, deletes the temporary schema tree and external fixture sources, then calls a candidate adapter. The adapter receives one JSON request filename containing:

```json
{
  "metadataDirectory": "/temporary/work/metadata",
  "outputDirectory": "/temporary/work/output",
  "configuration": {
    "flags": ["--indentation-size", "2"],
    "api": null,
    "logicalEntry": "schema"
  },
  "sourceFilesUnavailable": true
}
```

The default adapter invokes `jsb --from-metadata --generator typescript`. The current CLI rejects that mode and cannot represent the programmatic configuration cases. Those limitations are reported as failures. VQ-1175/1176/1177 supply complete metadata semantics and the native backend/adapter; this harness already accepts an independent adapter command as a JSON argv array:

```sh
npm run fidelity:metadata -- --adapter '["node", "/absolute/path/to/native-adapter.mjs"]'
```

Adapters execute in a temporary working directory, write their complete generated files into `outputDirectory`, and exit nonzero on failure. Use absolute script paths; arguments are passed directly without a shell. Removing the temporary sources checks the input boundary, while the production architecture still requires independent review for hidden source dependencies.

Reference generation always uses the verified published package. There is no command to rewrite or normalize expected bytes. New fixtures/configurations require an explicit reviewed source change; the old default reference and original package remain fixed. The original self-dependency elsewhere in the repository is unchanged pending VQ-54.

## Recorded candidate results

[The verification summary](../../docs/fidelity-harness/2026-10-26/summary.json) identifies the tested commit, commands and hashes for the compressed full JSON reports. The oracle matched all 20 scenarios; the current legacy candidate matched 5 and differed in 15, including the known 12 differing files in the default output. Metadata comparison failed in all 20 scenarios: 3 during external-import metadata export and 17 at generation. These are measured candidate failures, not passing release checks.
