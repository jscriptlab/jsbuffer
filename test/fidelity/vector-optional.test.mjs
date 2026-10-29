import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  root,
  prepareOracle,
  scenarios,
  compareScenario,
  seed,
  run,
  readTree,
  compareTrees
} from '../../tools/fidelity/core.mjs';

const require = createRequire(import.meta.url);
const adapter = [
  process.execPath,
  path.join(root, 'tools/fidelity/native-adapter.mjs')
];
let oracle, base, definitions;
before(async () => {
  oracle = await prepareOracle();
  definitions = await scenarios();
  base = {
    id: 'vector-optional',
    entry: 'containers',
    files: {
      'source/containers': await fs.readFile(
        new URL('./fixtures/vector-optional', import.meta.url),
        'utf8'
      )
    }
  };
});

test('vector/optional output preserves original files, bytes, options and recursive metadata', async (t) => {
  const options = definitions.filter(
    (s) =>
      s.entry === 'schema' &&
      (s.flags ||
        s.id === 'programmatic-config' ||
        s.id === 'programmatic-no-config')
  );
  for (const option of [{ id: 'default' }, ...options]) {
    await t.test(option.id, async () => {
      const result = await compareScenario(
        {
          ...base,
          ...option,
          id: 'vector-optional-' + option.id,
          entry: base.entry,
          files: { ...option.files, ...base.files }
        },
        oracle,
        { mode: 'metadata', adapter }
      );
      assert.equal(result.status, 'matched', JSON.stringify(result, null, 2));
      assert.equal(result.sourceFilesUnavailable, true);
    });
  }
});

test('unsupported types nested under vector/optional remain explicit generation failures', async () => {
  for (const member of [
    'vector<map<string,int>>',
    'optional<tuple<int,string>>',
    'vector<Other>',
    'vector<int8>',
    'optional<uint8>'
  ]) {
    const result = await compareScenario(
      {
        id: 'unsupported-nested',
        entry: 'items',
        files: {
          'source/items': `type Other {}\nexport type Items { ${member} value; }\n`
        }
      },
      oracle,
      { mode: 'metadata', adapter }
    );
    assert.equal(
      result.status,
      'candidate-generation-failed',
      JSON.stringify(result)
    );
    assert.match(result.candidateRun.stderr, /not implemented yet/);
  }
});

test('recursive templates preserve renamed, empty and multiple declarations', async () => {
  const result = await compareScenario(
    {
      id: 'renamed-containers',
      entry: 'Nested_Names.jsb',
      files: {
        'source/Nested_Names.jsb':
          'export type Empty {}\ntype Packet_List { optional<vector<bytes>> chunks; }\nexport type Toggles { vector<optional<bool>> flags; int tail; }\n'
      }
    },
    oracle,
    { mode: 'metadata', adapter }
  );
  assert.equal(result.status, 'matched', JSON.stringify(result, null, 2));
  assert.equal(result.sourceFilesUnavailable, true);
});

async function checked(command, cwd) {
  const result = await run(command, { cwd });
  assert.equal(result.ok, true, result.stdout + result.stderr);
}

async function generatedCase(t) {
  const directory = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-containers-'))
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const reference = await seed(path.join(directory, 'reference'), base);
  await checked(
    [
      process.execPath,
      path.join(oracle.directory, 'cli/index.js'),
      'source/containers',
      '-o',
      reference.output
    ],
    reference.directory
  );
  const candidate = await seed(path.join(directory, 'candidate'), base);
  const metadata = path.join(candidate.directory, 'metadata');
  await checked(
    [
      process.execPath,
      path.join(root, 'cli/jsb.js'),
      'source/containers',
      '--metadata-only',
      '-o',
      metadata
    ],
    candidate.directory
  );
  const { default: load } = require('../../cli/loadFileMetadataList.js');
  const files = await load(metadata, { requireContract: true });
  await fs.rm(candidate.source, { recursive: true });
  await assert.rejects(fs.access(candidate.source));
  files.forEach((file) => {
    file.path = '/unavailable/' + file.contract.logicalPath;
  });
  const {
    default: Generator
  } = require('../../src/generators/typescript/FileGeneratorTypeScript.js');
  const records = await new Generator(files).generate();
  await fs.mkdir(candidate.output, { recursive: true });
  for (const file of records)
    await fs.writeFile(path.join(candidate.output, file.path), file.contents);
  assert.equal(
    compareTrees(
      await readTree(reference.output),
      await readTree(candidate.output)
    ).equal,
    true
  );
  return {
    directory,
    reference: reference.output,
    native: candidate.output,
    files,
    records
  };
}

function compilerOptions(ts) {
  return {
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
}

async function compileConsumer(output) {
  const ts = require('typescript');
  const consumer = path.join(output, 'consumer.ts');
  await fs.writeFile(
    consumer,
    `import Serializer from '@jsbuffer/codec/Serializer';
import Deserializer from '@jsbuffer/codec/Deserializer';
import { Containers, defaultContainers, encodeContainers, decodeContainers, isContainers, compareContainers, updateContainers } from './containers';
const nested: ReadonlyArray<ReadonlyArray<number> | null> = [null, [], [0, 4294967295]];
const value = Containers({ ...defaultContainers(), nested, signed: [-32768, 32767], title: null, selection: [true, null, false] });
const serializer = new Serializer({textEncoder: new TextEncoder()});
encodeContainers(serializer, value);
const decoded = decodeContainers(new Deserializer({buffer: serializer.view(), textDecoder: new TextDecoder()}));
if (decoded && isContainers(decoded)) {
  compareContainers(value, decoded);
  updateContainers(value, { nested: decoded.nested, title: 'changed' });
}
`
  );
  const options = compilerOptions(ts);
  const program = ts.createProgram([consumer], options);
  assert.deepEqual(
    ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    [],
    output + ': strict compilation'
  );
  const javascript = ts.transpileModule(
    await fs.readFile(path.join(output, 'containers.ts'), 'utf8'),
    {
      compilerOptions: { ...options, noEmit: false }
    }
  ).outputText;
  const module = { exports: {} };
  new Function('exports', 'require', 'module', javascript)(
    module.exports,
    require,
    module
  );
  return module.exports;
}

function packetLength(value) {
  const utf8 = (text) => new TextEncoder().encode(text).byteLength;
  const optional = (value, length) => 1 + (value === null ? 0 : length(value));
  const vector = (items, length) =>
    4 + items.reduce((total, value) => total + length(value), 0);
  return (
    4 +
    4 +
    4 + // CRC header and the first/last int32 fields.
    vector(value.signed, () => 2) +
    vector(value.unsigned, () => 2) +
    optional(value.title, (text) => 4 + utf8(text)) +
    vector(value.words, (text) => 4 + utf8(text)) +
    vector(value.blocks, (bytes) => 4 + bytes.byteLength) +
    vector(value.nested, (entry) =>
      optional(entry, (items) => vector(items, () => 4))
    ) +
    optional(value.selection, (flags) =>
      vector(flags, (flag) => optional(flag, () => 1))
    ) +
    optional(value.repeated, (entry) => optional(entry, () => 4)) +
    vector(value.matrix, (row) =>
      vector(row, (bytes) => 4 + bytes.byteLength)
    ) +
    optional(value.terminated, (text) => utf8(text) + 1) +
    vector(value.longs, () => 8) +
    vector(value.singles, () => 4) +
    optional(value.limit, () => 8) +
    optional(value.packet, (bytes) => 4 + bytes.byteLength) +
    optional(value.real, () => 8)
  );
}

test('strict consumers and real codecs verify recursive values, defaults, validation, comparison and updates', async (t) => {
  const generated = await generatedCase(t);
  const reference = await compileConsumer(generated.reference);
  const native = await compileConsumer(generated.native);
  const { Serializer, Deserializer } = require('@jsbuffer/codec');
  const samples = [
    {},
    {
      first: -2147483648,
      last: 2147483647,
      signed: [-32768, 0, 32767],
      unsigned: [0, 65535],
      title: 'á🙂',
      words: ['', 'hello', 'é'],
      blocks: [new Uint8Array(), new Uint8Array([0, 255])],
      nested: [null, [], [0, 4294967295]],
      selection: [true, null, false],
      repeated: -2147483648,
      matrix: [[], [new Uint8Array([1, 2]), new Uint8Array()]],
      terminated: 'end',
      longs: ['-9223372036854775808', '9223372036854775807'],
      singles: [-2.25, 0, 1.5],
      limit: '18446744073709551615',
      packet: new Uint8Array([8, 9]),
      real: -2.5
    },
    {
      signed: [1],
      unsigned: [1],
      title: '',
      words: [''],
      nested: [[1], null, [2, 3]],
      selection: [],
      repeated: 0,
      matrix: [[new Uint8Array([255])]],
      terminated: '',
      longs: ['0'],
      singles: [1.5],
      limit: '0',
      packet: new Uint8Array(),
      real: 0
    }
  ];
  const defaults = native.defaultContainers();
  assert.deepEqual(defaults, reference.defaultContainers());
  assert.deepEqual(defaults.nested, []);
  assert.equal(defaults.selection, null);
  assert.equal(defaults.title, null);
  for (const sample of samples)
    for (const littleEndian of [true, false]) {
      const referenceValue = reference.defaultContainers(
        structuredClone(sample)
      );
      const value = native.defaultContainers(structuredClone(sample));
      assert.deepEqual(value, referenceValue);
      const buffers = [];
      for (const [api, input] of [
        [reference, referenceValue],
        [native, value]
      ]) {
        assert.equal(api.isContainers(input), true);
        const serializer = new Serializer({
          textEncoder: new TextEncoder(),
          littleEndian,
          tailByteLength: 4096
        });
        api.encodeContainers(serializer, input);
        buffers.push(Uint8Array.from(serializer.view()));
      }
      assert.deepEqual(buffers[1], buffers[0], 'reference/native wire bytes');
      assert.equal(
        buffers[1].byteLength,
        packetLength(value),
        'independent length/optional-marker accounting'
      );
      for (const api of [reference, native])
        for (const buffer of buffers) {
          const decoded = api.decodeContainers(
            new Deserializer({
              buffer,
              littleEndian,
              textDecoder: new TextDecoder()
            })
          );
          assert.deepEqual(decoded, value);
          assert.equal(api.compareContainers(value, decoded), true);
          assert.equal(api.isContainers(decoded), true);
        }
      const wrongHeader = Uint8Array.from(buffers[1]);
      wrongHeader[0] ^= 0x40;
      assert.equal(
        native.decodeContainers(
          new Deserializer({
            buffer: wrongHeader,
            littleEndian,
            textDecoder: new TextDecoder()
          })
        ),
        null
      );
      assert.equal(
        native.compareContainers(value, structuredClone(value)),
        true
      );
      assert.equal(
        native.updateContainers(value, {
          nested: structuredClone(value.nested),
          title: value.title
        }),
        value
      );
      const untouched = structuredClone(value);
      for (const changes of [
        { signed: [123] },
        { selection: value.selection === null ? [false] : null },
        {
          nested: value.nested.length
            ? [[123], ...value.nested.slice(1)]
            : [[123]]
        }
      ]) {
        const updated = native.updateContainers(value, changes);
        assert.notEqual(updated, value);
        assert.equal(native.compareContainers(value, updated), false);
        assert.deepEqual(
          value,
          untouched,
          'updates must preserve the original value'
        );
      }
      const changed = native.updateContainers(value, {
        signed: [123],
        title: value.title === null ? 'present' : null
      });
      assert.notEqual(changed, value);
      assert.equal(native.compareContainers(value, changed), false);
      assert.deepEqual(
        changed,
        reference.updateContainers(referenceValue, {
          signed: [123],
          title: value.title === null ? 'present' : null
        })
      );
      for (const invalid of [
        { ...value, signed: 'wrong' },
        { ...value, title: 42 },
        { ...value, nested: ['wrong'] },
        { ...value, matrix: [[42]] }
      ]) {
        assert.equal(native.isContainers(invalid), false);
        assert.equal(reference.isContainers(invalid), false);
      }
    }
});

test('recursive template generation works in a fresh process with filesystem/frontend/legacy imports denied', async (t) => {
  const generated = await generatedCase(t);
  const input = path.join(generated.directory, 'metadata.json');
  await fs.writeFile(input, JSON.stringify(generated.files));
  const probe = path.join(generated.directory, 'probe.cjs');
  await fs.writeFile(
    probe,
    `const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const files = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const root = process.argv[3];
const original = Module._load;
Module._load = function(request, parent, isMain) {
  if (['fs', 'node:fs', 'fs/promises', 'node:fs/promises'].includes(request)) throw Error('Filesystem denied: ' + request);
  const resolved = Module._resolveFilename(request, parent);
  if (typeof resolved === 'string' && (resolved.startsWith(path.join(root, 'code-generator') + path.sep) ||
    ['src/parser/Parser.js', 'src/core/ASTGenerator.js', 'src/core/Tokenizer.js', 'cli/jsb.js', 'cli/index.js'].some(file => resolved === path.join(root, file)))) throw Error('Frontend/legacy import denied: ' + resolved);
  return original.call(this, request, parent, isMain);
};
const Generator = require(path.join(root, 'src/generators/typescript/FileGeneratorTypeScript.js')).default;
new Generator(files).generate().then(files => process.stdout.write(JSON.stringify(files))).catch(error => { console.error(error); process.exitCode = 1; });
`
  );
  const result = await run([process.execPath, probe, input, root]);
  assert.equal(result.ok, true, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), generated.records);
});
