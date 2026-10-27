# VQ-36: prior TypeScript draft reuse audit

Compared `draft/typescript-from-metadata` at
`8a195e312f074c54e963c012fc23dfa42ae42233` against verified integration tree
`ec383eca7a5ac60a6822526a269b50f2dad9a882`. That tree is byte-identical to
`develop` at `a466a392b5361a40d6d514a50fdf02b67590142f` after PR #37/#38 squash
merges. The baseline before those evidence/CI additions is
`63c86049823b6be45ccf9f1b1cb60faac1ce1e8d`.

`git merge-base --is-ancestor` confirms the draft is already an ancestor of the
integration tree (exit 0). Branch preservation is the disposition: no deletion,
reset of the remote draft, or wholesale cherry-pick is necessary.

| Area | Verified result | Reuse or gap |
| --- | --- | --- |
| TypeScript backend | `src/generators/typescript/FileGeneratorTypeScript.ts` has identical blob `3422c236b36e800cb022c2a102882536c06490fa` on draft and integration | Already integrated. Its `generate()` remains unfinished; the baseline separately measured 190 diagnostics with its excluded build target. Do not mistake unchanged code for a working backend |
| TypeScript utilities/options | `fileGeneratorUtilities.ts` blob `974fb0ae819a68215b24735f501b39f805fe5617`, `types.ts` blob `e4e5a509c73513e54b0ff7320671b2832029bfc0`, identical | Reuse structural knowledge and generic rendering branches during VQ-1176, after reconciling original naming and dead AST-dependent methods |
| AST, traits/calls, tuple/template argument syntax | `src/core/ASTGenerator.ts` blob `f0900cc87bc327f62068c4dd9a63967e7204eb61`, identical | Already integrated grammar. Preserve ordered nodes and all template arguments; no AST recovery from draft needed |
| Parser metadata | Draft blob `2c21ce118909fb8ecdee33283749abe416c186b2`, integration `fa97f383bed001f0be75d2db1eb9bab972bc97de` | Integration adds trait memberships and call returns (21 additions/1 deletion). Reuse current implementation; draft is less complete |
| Metadata type definitions | Draft blob `82f9c0987d00706bda64ad0c8aa408ac54e69064`, integration `a0f2a01ffab8e851433c5989da6054ffbe3f0291` | Integration adds `traits`, `returnType`, distinct optional-template type (21 additions/1 deletion). Tuples, templates and reference kinds already exist |
| Resolver | `src/resolver/Resolver.ts` and its project config are additions after draft (106 and 12 lines) | Existing consumer lookup can inform backend work. Do not refactor its CodeStream inheritance here; VQ-57 owns that decision |
| Unified CLI and persistence | Integration adds `cli/loadFileMetadataList.ts` and from-metadata dispatch/ordered manifests | Reuse for graph reload; enrich validation. TypeScript dispatch still delegates source generation to the later legacy generator and rejects persisted metadata |
| Legacy source generator | `code-generator/FileGenerator.ts` blob `eb4135b9711e02a9578435f5cb3fc70a6dc47d48`, identical across draft/integration | No hidden draft fix. Useful source comparison only; production native generation must not delegate to it |
| Imports | Current parser has relative references and reserved external-module metadata kinds, but rejected package imports | VQ-1175 adds actual package resolution, resolved logical targets and compiled import identities; future renderer consumes this graph |
| Ordering, original identities and validation | Current generic metadata omitted source order after sorting, original `.jsb` wire spelling and explicit CRC input; loader validated only shallow shape | VQ-1175 adds a versioned additive contract and source-independent validation/order selection |

## Output-preserving reuse versus behavior changes

Reuse current semantic metadata for generics, traits, calls, tuples and nested
templates. Keep existing C99/C++17/Kotlin consumer values unchanged. Preserve
source names rather than importing later camel-case helper normalization into
the original profile. Original `1.0.28` wire paths retain `.jsb`; the modern
parser's `Metadata.globalName` removes that suffix. The new contract stores the
original identity separately so other consumers do not change.

Later 1.x naming normalization, source-grammar extensions (including block
comments), removing generated fields, changing sort defaults, formatting, or
fixing apparent original rendering oddities are not automatic compatibility
improvements. They require an explicit decision outside original byte-fidelity
acceptance. The pinned original's unsupported block-comment/external-root
fixtures remain negative tests. No such output-changing choice is authorized
by this reuse audit.

## Reproduction and limits

Use `git diff --numstat <draft> <integration> -- src/parser src/core
src/generators/typescript src/resolver cli code-generator`, `git rev-parse
<ref>:<file>`, and `git merge-base --is-ancestor <draft> <integration>`.
The TypeScript/AST/legacy equivalence claims above are Git-blob equality, not an
inference from branch titles. The 190-diagnostic observation belongs to the
frozen VQ-38 baseline; this audit does not claim the excluded backend now builds.

Native TypeScript rendering, helper allocation, original import emission and
sidecar serialization remain VQ-1176; CLI/API dispatch remains VQ-1177. The
source-removed contract tests provide their input contract, not a substitute for
VQ-1178's full output/runtime/architecture acceptance.
