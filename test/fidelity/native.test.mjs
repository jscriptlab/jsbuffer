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
let oracle, definitions;
before(async () => {
  oracle = await prepareOracle();
  definitions = await scenarios();
});
async function temp(t) {
  const dir = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-native-'))
  );
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}
function assertMatched(result) {
  assert.equal(result.status, 'matched', JSON.stringify(result, null, 2));
  assert.equal(result.sourceFilesUnavailable, true);
}
async function checked(command, cwd) {
  const result = await run(command, { cwd });
  assert.equal(result.ok, true, result.stdout + result.stderr);
}

test('native scalar and wire-name output matches every original file after source removal', async () => {
  const result = await compareScenario(
    definitions.find((s) => s.id === 'scalars'),
    oracle,
    { mode: 'metadata', adapter }
  );
  assertMatched(result);
  assert.deepEqual(Object.keys(result.actual).sort(), [
    '__types__.ts',
    'scalars.metadata.json',
    'scalars.ts',
    'tsconfig.json'
  ]);
  assertMatched(
    await compareScenario(
      definitions.find((s) => s.id === 'wire-names'),
      oracle,
      { mode: 'metadata', adapter }
    )
  );
});

test('native scalar options preserve original formatting, order and API configuration', async (t) => {
  const base = definitions.find((s) => s.id === 'scalars');
  const options = definitions
    .filter(
      (s) =>
        s.flags ||
        s.id === 'programmatic-config' ||
        s.id === 'programmatic-no-config'
    )
    .filter((s) => s.entry === 'schema');
  for (const scenario of options)
    await t.test(scenario.id, async () => {
      assertMatched(
        await compareScenario(
          {
            ...base,
            ...scenario,
            id: 'native-scalars-' + scenario.id,
            entry: 'scalars'
          },
          oracle,
          { mode: 'metadata', adapter }
        )
      );
    });
});

test('renderer uses metadata names and declaration order beyond the scalar fixture', async () => {
  const scenario = {
    id: 'native-renamed',
    entry: 'OtherNames.jsb',
    files: {
      'source/OtherNames.jsb':
        'export type Empty {}\ntype sample_Record { string caption; uint32 quota; bytes payload; }\nexport type Toggled { bool enabled; }\n'
    }
  };
  assertMatched(
    await compareScenario(scenario, oracle, { mode: 'metadata', adapter })
  );
});

test('unsupported features fail visibly through the native adapter', async () => {
  for (const scenario of [
    definitions.find((s) => s.id === 'default'),
    {
      id: 'native-template',
      entry: 'items',
      files: { 'source/items': 'export type Items { vector<int> ids; }\n' }
    },
    {
      id: 'native-call',
      entry: 'request',
      files: { 'source/request': 'export call Fetch => int { int id; }\n' }
    },
    {
      id: 'native-trait',
      entry: 'result',
      files: {
        'source/result':
          'export trait Result {}\nexport type ResultValue : Result { int id; }\n'
      }
    }
  ]) {
    const result = await compareScenario(scenario, oracle, {
      mode: 'metadata',
      adapter
    });
    assert.equal(
      result.status,
      'candidate-generation-failed',
      JSON.stringify(result)
    );
    assert.equal(result.candidateRun.stage, 'metadata-generation');
    assert.match(result.candidateRun.stderr, /not implemented yet/);
  }
});

test('native backend generates with filesystem and frontend/legacy module imports denied', async (t) => {
  const dir = await temp(t),
    scenario = definitions.find((s) => s.id === 'scalars');
  const context = await seed(path.join(dir, 'case'), scenario);
  const metadata = path.join(context.directory, 'metadata');
  await checked(
    [
      process.execPath,
      path.join(root, 'cli/jsb.js'),
      'source/scalars',
      '--metadata-only',
      '-o',
      metadata
    ],
    context.directory
  );
  await fs.rm(context.source, { recursive: true });
  // Read JSON at the adapter boundary, before denying backend I/O/imports.
  const { default: load } = require('../../cli/loadFileMetadataList.js');
  const files = await load(metadata, { requireContract: true });
  files.forEach((file) => {
    file.path = '/unavailable/' + file.contract.logicalPath;
  });
  const input = path.join(dir, 'input.json');
  await fs.writeFile(input, JSON.stringify(files));
  const probe = path.join(dir, 'probe.cjs');
  await fs.writeFile(
    probe,
    `
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const files=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const root=process.argv[3];
const original=Module._load;
Module._load=function(request,parent,isMain){
  if(['fs','node:fs','fs/promises','node:fs/promises'].includes(request))throw Error('Backend filesystem import denied: '+request);
  const resolved=Module._resolveFilename(request,parent);
  if(typeof resolved==='string' && (resolved.startsWith(path.join(root,'code-generator')+path.sep) || [
    'src/parser/Parser.js','src/core/ASTGenerator.js','src/core/Tokenizer.js','cli/jsb.js','cli/index.js'
  ].some(file=>resolved===path.join(root,file))))throw Error('Frontend/legacy import denied: '+resolved);
  return original.call(this,request,parent,isMain);
};
const Generator=require(path.join(root,'src/generators/typescript/FileGeneratorTypeScript.js')).default;
new Generator(files).generate().then(result=>process.stdout.write(JSON.stringify(result))).catch(error=>{console.error(error);process.exitCode=1;});
`
  );
  const result = await run([process.execPath, probe, input, root]);
  assert.equal(result.ok, true, result.stderr);
  const generated = JSON.parse(result.stdout);
  assert.equal(generated.length, 4);
  assert.match(
    generated.find((file) => file.path === 'scalars.ts').contents,
    /encodeScalars/
  );
  const {
    default: Generator
  } = require('../../src/generators/typescript/FileGeneratorTypeScript.js');
  const legacy = structuredClone(files);
  delete legacy[0].contract;
  await assert.rejects(
    new Generator(legacy).generate(),
    /contract is required/
  );
});

test('original scalar compilation conflicts remain explicit and identical', async (t) => {
  const dir = await temp(t),
    scenario = definitions.find((s) => s.id === 'scalars');
  const context = await seed(path.join(dir, 'reference'), scenario);
  await checked(
    [
      process.execPath,
      path.join(oracle.directory, 'cli/index.js'),
      'source/scalars',
      '-o',
      context.output
    ],
    context.directory
  );
  const metadata = path.join(context.directory, 'metadata');
  await checked(
    [
      process.execPath,
      path.join(root, 'cli/jsb.js'),
      'source/scalars',
      '--metadata-only',
      '-o',
      metadata
    ],
    context.directory
  );
  await fs.rm(context.source, { recursive: true });
  const request = path.join(dir, 'request.json'),
    output = path.join(dir, 'candidate');
  await fs.writeFile(
    request,
    JSON.stringify({
      metadataDirectory: metadata,
      outputDirectory: output,
      configuration: { flags: [], api: null, logicalEntry: 'scalars' }
    })
  );
  await checked([...adapter, request], context.directory);
  assert.equal(
    compareTrees(await readTree(context.output), await readTree(output)).equal,
    true
  );
  const ts = require('typescript');
  const diagnostics = (directory) => {
    const program = ts.createProgram(
      [
        path.join(directory, 'scalars.ts'),
        path.join(directory, '__types__.ts')
      ],
      {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noEmit: true,
        types: [],
        baseUrl: root,
        paths: { jsbi: [path.join(root, 'node_modules/jsbi/jsbi.d.ts')] }
      }
    );
    return ts.getPreEmitDiagnostics(program).map((d) => ({
      code: d.code,
      file: path.basename(d.file?.fileName ?? ''),
      start: d.start,
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n')
    }));
  };
  const original = diagnostics(context.output),
    native = diagnostics(output);
  assert.deepEqual(native, original);
  assert.ok(
    original.some(
      (d) => d.code === 2339 && /(?:read|write)(?:Int16|Uint16)/.test(d.message)
    )
  );
  assert.ok(original.some((d) => d.code === 2454));
  t.diagnostic(
    'Preserved original compile diagnostics: ' + JSON.stringify(original)
  );
});
