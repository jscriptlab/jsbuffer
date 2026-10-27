# Native TypeScript first-increment verification

This is the historical pre-fix snapshot at source 42f56da. The subsequent
default 16-bit declaration fix supersedes four errors in compiler-conflicts.json.
That JSON is retained as historical evidence; current tests require 16-bit
consumers to compile and run, without an expected-diagnostic allowance. See
[the current fix verification](../../int16-support-types/2026-10-27/README.md).

Source: `42f56da7eab1ee364e459d90aad8921bce067b51`.
Base: `2b50a5954fe6e4b9aea59f07264a209814e481a9`, the PR #39 squash merge
into develop. [Implementation and boundaries](../../native-typescript.md).
VQ-1176 remains In Progress; this is the approved primitive-rendering increment.

Tests/build use Node 20.17.0, npm 10.8.2, locked TypeScript 5.2.2 on macOS arm64.
The oracle remains the pinned published `jsbuffer@1.0.28`, source
`b4089d8a86a71a11507756ecb48838487e546033`, with its verified 74-file inventory
and frozen runtime lock. No dependency, lock, original input or reference output
was changed. The unfinished TypeScript prototype's excluded build is replaced
by an included backend target; the target now compiles and lints.

| Executed command/check | Result |
| --- | --- |
| `npm run build` | Passed, including the native TypeScript project |
| `npx eslint src/generators/typescript` | Passed; folder exclusion removed |
| `npm run test:fidelity` | 64 passed, 0 failed, 0 skipped: existing 46 plus 18 native/configuration tests |
| `npx ava test/parser/Parser.js test/fromMetadata.js test/kotlin.js` | 7 passed |
| `npm run fidelity:native -- --scenarios scalars --report <file>` | Exit 0, exact four-file comparison, sources removed |
| `npm run fidelity:native -- --report <file>` | Exit 1: wire-names/scalars match, 18 scenarios fail explicitly during native generation |
| Existing consumer inventories | 63 file sizes/SHA-256 hashes unchanged (C99 24, C++17 13, Kotlin 26), compared to the prior committed inventory |

The scalar files total 18,509 bytes. `scalars.json.gz` preserves every expected
and actual file hash and raw comparison result. `full-corpus.json.gz` retains
all 20 actual outcomes; unsupported features and the API rootDir export mismatch
remain visible failures. `fidelity.tap` includes twelve additional scalar
configuration comparisons, renamed/multiple/empty declarations, unsupported
call/trait/template checks, source removal and a fresh-process denied-import
probe. This probe blocks fs module imports and parser/AST/legacy modules before
loading the backend; it is not an OS sandbox or full architecture acceptance.

The strict generated-program compilation test produces the same six diagnostics
for original and native output. `compiler-conflicts.json` records compiler
settings and full diagnostic text/offsets. Four methods are absent from emitted
support interfaces; two 8-bit decoder locals are unassigned. These are inherited
original-output conflicts, not passing generated-code compilation. VQ-1178 must
resolve that policy explicitly; codec/runtime acceptance was not run or waived.

`manifest.json` covers the six raw evidence files. Compressed JSON uses gzip
mtime 0. Temporary absolute paths in reports identify this run; the backend uses
only persisted logical identity and explicit options. Production CLI routing is
unchanged until VQ-1177, and no release/publication action was performed.
