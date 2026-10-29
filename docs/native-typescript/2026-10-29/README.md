# Native vector/optional increment

Source: `d9df71a573c248a8846b1f659059c31492c256a8`.
Base: develop `f2c3956bc86c5dfef1f2edbe0b22ad5908bfdbff`.

The metadata-only backend now recursively renders `vector<T>` and
`optional<T>` over the 13 primitive names with implemented codec operations.
This covers interfaces, validation, creators, encode/decode, defaults,
comparison/update, compact metadata sidecars, support types and tsconfig.
Local-variable depth counters and formatting follow the original emitter.
No parser, schema reopening or legacy generator is used by the backend.

The fixture includes `vector<optional<vector<uint32>>>`,
`optional<vector<optional<bool>>>`, repeated optionals, byte-array matrices,
UTF-8 strings, signed/unsigned 16-bit boundaries, signed/unsigned 64-bit
boundaries, floats and empty/present/absent values. A separate case covers
renamed, multiple and empty declarations.

## Verification

Local macOS arm64, Node 20.17.0, npm 10.8.2, locked TypeScript 5.2.2:

| Check                                                 | Result                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Full build, native ESLint and changed-file formatting | Passed                                                                                                                                     |
| Targeted vector/optional suite                        | 18 passed, 0 failed, 0 skipped                                                                                                             |
| Full fidelity suite                                   | 83 passed, 0 failed, 0 skipped                                                                                                             |
| Default + 12 option/API variants                      | Identical file set, paths and raw bytes against the approved reference, after schema removal                                               |
| Reference/native strict consumers                     | Zero compiler diagnostics                                                                                                                  |
| Real codec, both byte orders                          | 6 reference/native packet pairs match; all 24 encoder/decoder combinations round-trip                                                      |
| Wire semantics                                        | Independent length/presence accounting and CRC rejection pass                                                                              |
| Generated helpers                                     | Defaults, representative invalid-value rejection, deep equality and immutable updates pass                                                 |
| Architecture                                          | Fresh process generates identical records with filesystem/frontend/legacy imports denied and source paths relocated to an unavailable root |
| Original 20-scenario native corpus                    | 2 matched / 18 explicit generation failures, exit 1                                                                                        |

`targeted.tap`, `fidelity.tap` and `full-corpus.json.gz` are raw captured
results. `manifest.json` records their hashes. The full corpus remains a
separate incomplete gate; the dedicated template fixtures do not turn its
unsupported composite scenarios into successes.

## Reference and remaining scope

The approved reference is still `jsbuffer@1.0.28+int16-interfaces.1`.
The correction, pristine published control, frozen baseline and metadata
contract are unchanged. No output normalization or diagnostic allowance was
introduced. Both generated consumers must compile and execute successfully.

Set/map/tuple/bigint templates, references/imports, traits/calls and production
CLI integration remain open under VQ-1176/1177. New templates explicitly reject
int8/uint8 leaves until the known original codec omission is resolved through
the VQ-1178 wire-compatibility decision. Original custom-discriminator behavior
also remains a separate decision. VQ-1176/1178 acceptance is not complete.

Reproduce:

```sh
npm ci
npm run build
node --test --test-concurrency=1 test/fidelity/vector-optional.test.mjs
npm run test:fidelity
npm run fidelity:native -- --report /tmp/vector-optional-full-corpus.json
```

The last command exits 1 while the remaining corpus features are unsupported.
