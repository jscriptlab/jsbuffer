import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  root,
  baseline,
  run,
  prepareOracle,
  scenarios,
  compareScenario,
  readTree,
  inventory
} from '../../tools/fidelity/core.mjs';
import {
  correctedProfile,
  correctedFile,
  declarationCorrections,
  correctInt16Interfaces
} from '../../tools/fidelity/reference-profile.mjs';

const require = createRequire(import.meta.url);
let oracle;
before(async () => {
  oracle = await prepareOracle();
});

test('default reference corrects only the approved interface declarations and preserves the published control', async () => {
  assert.equal(oracle.pin.outputProfile, correctedProfile);
  const original = await fs.readFile(
    path.join(oracle.publishedDirectory, correctedFile),
    'utf8'
  );
  const corrected = await fs.readFile(
    path.join(oracle.directory, correctedFile),
    'utf8'
  );
  assert.equal(corrected, correctInt16Interfaces(original));
  assert.throws(
    () => correctInt16Interfaces(corrected),
    /Unexpected original generator source/
  );
  assert.equal(oracle.pin.correction.declarations.length, 4);
  for (const [, declaration] of declarationCorrections)
    assert.equal(corrected.split(declaration).length, 2);
  const scenario = (await scenarios()).find((s) => s.id === 'default');
  const result = await compareScenario(scenario, oracle, {
    mode: 'legacy',
    candidateCommand: [
      process.execPath,
      path.join(oracle.publishedDirectory, 'cli/index.js')
    ]
  });
  assert.equal(result.status, 'mismatch', JSON.stringify(result));
  assert.deepEqual(
    result.comparison.changed.map((file) => file.path),
    ['__types__.ts']
  );
  assert.deepEqual(result.comparison.missing, []);
  assert.deepEqual(result.comparison.extra, []);
  assert.deepEqual(
    result.actual,
    inventory(await readTree(path.join(baseline, 'original-default-output')))
  );
});

test('legacy and native defaults generate compilable, functioning signed/unsigned 16-bit consumers', async (t) => {
  const directory = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-int16-'))
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const source = path.join(directory, 'source');
  await fs.mkdir(source);
  await fs.writeFile(
    path.join(source, 'words'),
    'export type Words { int16 signed; uint16 unsigned; }\n'
  );
  const checked = async (command) => {
    const result = await run(command, { cwd: directory });
    assert.equal(result.ok, true, result.stdout + result.stderr);
  };
  const metadata = path.join(directory, 'metadata');
  await checked([
    process.execPath,
    path.join(root, 'cli/jsb.js'),
    'source/words',
    '--metadata-only',
    '-o',
    metadata
  ]);
  const outputs = [];
  for (const [name, entry] of [
    ['legacy', 'cli/index.js'],
    ['schema-cli', 'cli/jsb.js']
  ]) {
    const output = path.join(directory, name);
    await checked([
      process.execPath,
      path.join(root, entry),
      'source/words',
      '-o',
      output,
      ...(entry === 'cli/jsb.js' ? ['--generator', 'typescript'] : [])
    ]);
    outputs.push(output);
  }
  await fs.rm(source, { recursive: true });
  await assert.rejects(fs.access(source));
  const native = path.join(directory, 'native'),
    request = path.join(directory, 'request.json');
  await fs.writeFile(
    request,
    JSON.stringify({
      metadataDirectory: metadata,
      outputDirectory: native,
      configuration: { flags: [], api: null, logicalEntry: 'words' }
    })
  );
  await checked([
    process.execPath,
    path.join(root, 'tools/fidelity/native-adapter.mjs'),
    request
  ]);
  outputs.push(native);
  const ts = require('typescript');
  const { default: Serializer } = require('@jsbuffer/codec/Serializer');
  const { default: Deserializer } = require('@jsbuffer/codec/Deserializer');
  for (const output of outputs) {
    const types = await fs.readFile(path.join(output, '__types__.ts'), 'utf8');
    for (const [, declaration] of declarationCorrections)
      assert.ok(types.includes(declaration), declaration);
    const usage = path.join(output, 'consumer.ts');
    await fs.writeFile(
      usage,
      `import Serializer from '@jsbuffer/codec/Serializer';
import Deserializer from '@jsbuffer/codec/Deserializer';
import {Words,encodeWords,decodeWords} from './words';
const serializer=new Serializer({textEncoder:new TextEncoder()});
encodeWords(serializer,Words({signed:-32768,unsigned:65535}));
decodeWords(new Deserializer({buffer:serializer.view(),textDecoder:new TextDecoder()}));
`
    );
    const options = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
      baseUrl: root,
      paths: {
        jsbi: [path.join(root, 'node_modules/jsbi/jsbi.d.ts')],
        '@jsbuffer/codec/*': [path.join(root, 'node_modules/@jsbuffer/codec/*')]
      }
    };
    const program = ts.createProgram([usage], options);
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    assert.deepEqual(
      diagnostics,
      [],
      path.basename(output) + ': generated consumer must compile'
    );
    const generated = await fs.readFile(path.join(output, 'words.ts'), 'utf8');
    const javascript = ts.transpileModule(generated, {
      compilerOptions: { ...options, noEmit: false }
    }).outputText;
    const module = { exports: {} };
    new Function('exports', 'require', 'module', javascript)(
      module.exports,
      require,
      module
    );
    const { Words, encodeWords, decodeWords } = module.exports;
    for (const littleEndian of [true, false])
      for (const signed of [-32768, -1, 0, 1, 32767])
        for (const unsigned of [0, 1, 65535]) {
          const value = Words({ signed, unsigned });
          const serializer = new Serializer({
            textEncoder: new TextEncoder(),
            littleEndian,
            tailByteLength: 64
          });
          encodeWords(serializer, value);
          assert.equal(
            serializer.view().byteLength,
            8,
            '4-byte header + two 16-bit values'
          );
          const decoded = decodeWords(
            new Deserializer({
              buffer: serializer.view(),
              textDecoder: new TextDecoder(),
              littleEndian
            })
          );
          assert.deepEqual(
            decoded,
            value,
            path.basename(output) + ': 16-bit round trip'
          );
        }
  }
});
