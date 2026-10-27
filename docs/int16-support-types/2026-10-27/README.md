# Default 16-bit support-interface fix

Source: `93a0eec63e827c1e33d8f22da56b0ef3ba2afc9e`, updating PR #40.
The user approved fixing this omission upstream and making correct declarations
the default, rather than accepting the original generator's typing errors.

Both `code-generator/FileGenerator.ts` and the native support-type renderer now
always emit `writeInt16`, `writeUint16`, `readInt16` and `readUint16`. The runtime
codec already implements these methods; no codec dependency or wire operation
was changed. CRCs, generated schema code and metadata sidecars are unchanged.
For the scalar fixture, only `__types__.ts` changes, by 126 bytes.

## Positive regression checks

Node 20.17.0, npm 10.8.2, locked TypeScript 5.2.2, macOS arm64:

| Executed check | Result |
| --- | --- |
| `npm run build` | Passed |
| `npx eslint code-generator/FileGenerator.ts src/generators/typescript` | Passed |
| `npm run test:fidelity` | 65 passed, 0 failed, 0 skipped |
| Default legacy CLI, schema CLI TypeScript route, native metadata route | Generated 16-bit consumers compile with zero diagnostics under strict TypeScript |
| Generated consumers + real @jsbuffer/codec 1.0.7 | 90 signed/unsigned boundary-value round trips pass across the three routes and both byte orders; each packet is 8 bytes including the header |
| Existing parser/C99/C++17/Kotlin tests | 7 passed |
| Corrected-reference native comparison | Scalar/wire-name cases match; full corpus remains 2 matched / 18 unsupported failures, exit 1 |

The expected-compilation-error test was removed. Its replacement requires zero
diagnostics and executes generated code using the real codec. The native test
removes schema files before metadata generation. This fixes the four missing
16-bit method errors; the independent original 8-bit/custom-discriminator issues
and broader VQ-1176/1178 acceptance remain open.

## Reference provenance

The default reference is now `jsbuffer@1.0.28+int16-interfaces.1`. Setup verifies
the original tarball integrity and all 74 package files, copies that verified
package within the frozen dependency environment, and applies exactly four
declaration additions to `code-generator/FileGenerator.js`. Every other package
file is verified unchanged. Reports record the correction script SHA-256 and
original/corrected generator source SHA-256.

The pristine published control remains selectable with
`--reference-profile published`. Its default 24-file tree still matches the
frozen baseline. A regression test compares the corrected and published outputs
and requires the sole difference to be `__types__.ts`. Output comparisons remain
raw bytes; no file or diagnostic is filtered or normalized.

Reproduce:

```sh
npm run build
npm run test:fidelity
npm run fidelity:native -- --scenarios scalars --report /tmp/int16-scalars.json
npm run fidelity:native -- --report /tmp/int16-full.json
npm run fidelity:compare -- --mode oracle --reference-profile published
```

The full native command intentionally exits 1 while the other 18 scenarios are
unimplemented. `manifest.json` hashes the four raw evidence artifacts. There is
no expected-error JSON or compiler-diagnostic allowance in this verification.
The previous six-diagnostic snapshot remains historical evidence for the
pre-fix source. No package was published and no master merge was performed.
