# JSBuffer release baseline

VQ-38 establishes the release baseline and the compatibility contract. The integration line is `develop` at `63c86049823b6be45ccf9f1b1cb60faac1ce1e8d`. The original TypeScript reference is the published `jsbuffer@1.0.28` package, associated with commit `b4089d8a86a71a11507756ecb48838487e546033`. Release acceptance remains open: current TypeScript generation differs from that reference, and metadata-only TypeScript generation is unavailable.

## Reference decision

The reference is 1.0.28 because the original FileGenerator on the master line has exactly the same Git blob (`c85eeb4350e740589da5e920c916acf64ff5b49b`) as the 1.0.28 release commit. This anchors “original 1.x” to the existing original implementation. The newest published 1.x version, 1.0.40, is retained as a separate comparison profile: it changes generated names and output bytes. These profiles are not interchangeable.

The 1.0.28 tarball's registry SHA-512 integrity and SHA-1 were verified against the acquired bytes. Its SHA-256, source commit, publication time, per-file hashes, runtime dependency lock, and preserved schema inputs are recorded in [package-provenance.json](package-provenance.json), [package-files.json](package-files.json), and [input-provenance.json](input-provenance.json). The npm `gitHead` and matching tag identify the publisher's source association; they are not an independent build attestation.

An unconstrained install resolves the historical `textstreamjs: 0.x` range to 0.1.0, whose changed constructor causes both published oracles to fail. The working oracle pins all seven direct runtime dependencies to the versions in the corresponding original source lock, including textstreamjs 0.0.4. The published jsbuffer tarballs remain unmodified. Both the failed unconstrained installs and the working locks are preserved. Future comparisons must use the exact locks, rather than resolve those ranges again.

## Frozen repository and registry state

The snapshot was acquired at `2026-10-26T18:21:36Z`. See [snapshot.json](snapshot.json) for all refs, tags, PRs, check URLs, and tool inventory.

| Item | Observed state |
| --- | --- |
| Integration baseline | develop `63c86049823b6be45ccf9f1b1cb60faac1ce1e8d`, package version 2.0.12 |
| Master snapshot | `0090357975ef68c11e78a9874a1743a974353591`, package version 1.0.28 |
| Initial user checkout | feature/openwiki-integration `ece329ad623f829649bfb7b69ab9d9847f3c8b20` |
| Registry latest | 2.0.12, publisher gitHead `b61df11ad7756eba85fd18781de12e69a481494c`, published 2024-10-22 |
| Registry newest 1.x | 1.0.40, publisher gitHead `372984bb530fee622c4647e435b06cb0b11a3cf5` |
| Existing self-dependency | package.json requests `^1.0.2`; the integration lock resolves 1.0.2 |
| Unified work | PR #24 merged as `24420e2a42c83efd20f9599def0b39782cc5b0eb`; PR #20 merged as `68bdc913ba770ba9bcb36a293e8b4145caf5863f` |
| CI and Changesets | PR #28 merged as `21aad812d67bd833192944cfe993b5a679678618`; PR #29 merged as `d759b87e633ee93e95509c914ca4c4039df0a705` |
| Remaining integrations | PR #30 OpenWiki open; PR #18 develop to master open with conflicts |

Master was changing during this session as dependency PRs merged. All findings here refer to the stated immutable snapshots. The working branch starts from develop and does not merge or reset either integration branch.

The registry's 2.0.12 gitHead is not an ancestor of the selected develop baseline. The two trees differ in 124 files, including new metadata/CLI/Kotlin work and generated artifacts. [published-source-comparison.json](published-source-comparison.json) records the merge base and complete path disposition for VQ-1184/VQ-30; a shared package version does not establish source identity.

The user reported configuring `release.yml` on npm as the publishing workflow, using `NPM_TOKEN`. [publication-configuration.json](publication-configuration.json) records this setup for VQ-1185, which verifies the actual workflow identity and authentication before publication.

## Compatibility acceptance

[contract.json](contract.json) enumerates the feature, option, output, architecture, and release-target matrix. Two independent gates apply at the exact release candidate:

1. Equivalent supported schemas and explicit configuration must produce the original 1.0.28 file set, relative paths, and raw bytes. This includes metadata sidecars, helpers, ordering, comments, formatting, defaults, imports, traits, calls, CRCs, and configuration files. Compilation and runtime/wire checks supplement the byte comparison. Expected files must not be normalized or rewritten to conceal differences.
2. The production TypeScript backend must consume complete persisted metadata and explicit configuration through the shared jsb contracts. Generation must succeed with source schemas unavailable. FileGenerator belongs only to the isolated test oracle; production must not delegate to it, reparse embedded source, or reopen schema files. Keep Metadata terminology through publication.

The original CLI's adjacent `jsbufferconfig.json` is recorded separately from its generated output directory. Its behavior belongs to CLI compatibility. Pre-existing input configuration files in an output directory are identified explicitly in the probes and excluded from the generated-file inventory.

## Executed checks

Execution used macOS arm64, the project's pinned Node 20.17.0, npm 10.8.2, and TypeScript 5.2.2. The Node distribution was downloaded from nodejs.org and its SHA-256 verified; see [node-provenance.json](node-provenance.json).

| Check | Result and scope |
| --- | --- |
| Clean `npm ci --no-audit --no-fund` | Passed with the integration lockfile unchanged |
| `npm run build` | Passed; its project list omits src/generators/typescript |
| `npm test` | Failed at native AVR configuration: `/usr/bin/avr-gcc` is missing. AVA fail-fast left five test files unrun in this attempt; 19 tests were skipped |
| Remaining non-native AVA files | 79 passed, 20 skipped; includes existing C/C++ metadata comparisons, Kotlin generation comparisons, generated TypeScript runtime tests, and current-legacy CLI fidelity |
| Direct TypeScript backend build | Failed with 190 TypeScript diagnostics; this backend is not validated by the normal build |
| TypeScript metadata CLI | Failed with the explicit unsupported-generator error |
| npm test's codec/formatter tail run separately | Logged `spawn clang-format ENOENT` but returned exit 0 because scripts/index.ts only logs its rejected promise. This is a failure-propagation defect, not a successful formatter check |
| Reference generation probes | 27 successful runs: nine scenarios each for pinned 1.0.28, pinned 1.0.40, and the candidate legacy CLI |
| Native/Kotlin execution | C99/C++17 host runtime, i386 runtime, AVR cross-compilation/simulation, and Kotlin compilation/runtime remain unrun in this audit |

Commands, timestamps, exit codes, durations, and complete output are retained in the adjacent result JSON files and [logs](logs). A command's recorded zero exit code does not override a failure visible in its log.

The original default corpus emits 24 files. Both 1.0.40 and the candidate emit the same paths but differ from 1.0.28 in 12 files. For example, `conversation.secondUser.User` becomes `conversation.second-user.User`. The existing fidelity test compares two entry points using the same current FileGenerator; its success does not establish original-version fidelity. See [reference-probes.json](reference-probes.json) and the raw [original-default-output](original-default-output).

All three extends-path probes emitted the expected relative string: same-directory `base.json`, parent `../base.json`, and sibling `../config/base.json`. They do not reproduce a serialization-path defect. Generated-project compilation for those scenarios remains part of VQ-45; no compatibility exception was introduced.

Test/generation commands changed 47 tracked native artifacts. [generated-after-tests.patch](generated-after-tests.patch) preserves that drift. This single regeneration does not establish repeat-run nondeterminism. The audit restores those production/generated files after recording the patch.

## Existing work and remaining gates

| Finding or next step | Existing issue |
| --- | --- |
| Expand the pinned oracle into complete raw-byte differential acceptance | VQ-1174 |
| Complete metadata semantics, including presentation/order/import information required by original output | VQ-1175 |
| Audit reusable draft logic and implement a compiling native backend | VQ-36 and VQ-1176 |
| Integrate jsb and independently accept fidelity, compilation/runtime, and source independence | VQ-1177 and VQ-1178 |
| Isolate the oracle before changing the existing self-dependency | VQ-54 |
| Reproduce config compilation behavior without silently changing reference bytes | VQ-45 |
| Native artifact drift and clean deterministic regeneration | VQ-50 |
| Missing local/native release toolchains and actual target execution | VQ-53, VQ-1179, VQ-1180, VQ-1181 |
| Node policy and CI reconciliation, including hidden formatter failure | VQ-52 and VQ-1182 |
| OpenWiki/source documentation integration | VQ-1183 |

No duplicate defect issues are needed for these findings. The first implementation step after this audit is VQ-1174: reuse the exact oracle and inputs, compare complete raw output against the new backend, and retain every mismatch as a failure. VQ-1175 uses those fixtures to define the metadata additions required by VQ-1176.

## Reproduction

The snapshot and generated reference bytes are frozen evidence. `capture.py` acquires a new live snapshot and verifies package downloads; it must not be used to silently replace this snapshot. It downloads tarballs to `.audit-vq38/oracles`. Node 20.17.0 is a local audit toolchain, not a global installation.

For each oracle, copy the corresponding `oracle-VERSION.package.json` and `oracle-VERSION.package-lock.json` to `.audit-vq38/oracles/VERSION/package.json` and `package-lock.json`, then run `npm ci --ignore-scripts --no-audit --no-fund` there using Node 20.17.0. The relative tarball filenames match capture.py's output. Build the integration baseline with its unchanged lock and run `probe.py` explicitly to regenerate the bounded probes. `run.py --node-bin PATH LABEL -- COMMAND...` records an explicitly chosen command and enforces a timeout for its process group.

The probe script is a baseline measurement tool. Full metadata-backend acceptance and comprehensive fixture coverage remain VQ-1174 and VQ-1178.
