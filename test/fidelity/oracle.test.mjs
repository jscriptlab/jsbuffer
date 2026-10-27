import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  baseline,
  compareScenario,
  compareSuite,
  inventory,
  prepareOracle,
  readTree,
  scenarios
} from '../../tools/fidelity/core.mjs';

let oracle, definitions;
before(async () => {
  oracle = await prepareOracle();
  definitions = await scenarios();
});

test('all declared supported options and feature fixtures reproduce the pinned oracle', async () => {
  const report = await compareSuite({ oracle, mode: 'oracle' });
  assert.equal(report.results.length, 20);
  assert.equal(
    report.passed,
    true,
    JSON.stringify(
      report.results.filter((entry) => entry.status !== 'matched'),
      null,
      2
    )
  );
  const original = report.results.find((entry) => entry.id === 'default');
  assert.deepEqual(
    original.expected,
    inventory(await readTree(path.join(baseline, 'original-default-output')))
  );
});

test('an independent candidate using different indentation produces a reported mismatch', async () => {
  const report = await compareSuite({
    oracle,
    mode: 'legacy',
    ids: ['default'],
    candidateCommand: [
      process.execPath,
      path.join(oracle.directory, 'cli/index.js'),
      '--indentation-size',
      '2'
    ]
  });
  assert.equal(report.passed, false);
  const result = report.results[0];
  assert.equal(result.status, 'mismatch');
  assert.equal(Object.keys(result.expected).length, 24);
  assert.ok(result.comparison.changed.length > 0);
  assert.deepEqual(result.comparison.missing, []);
  assert.deepEqual(result.comparison.extra, []);
});

test('metadata adapters receive persisted data with schema sources removed', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-adapter-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const adapter = path.join(directory, 'adapter.mjs');
  await fs.writeFile(
    adapter,
    `import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const request=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
assert.equal(request.sourceFilesUnavailable,true);
await assert.rejects(fs.access(path.join(process.cwd(),'source')));
assert.ok((await fs.readdir(request.metadataDirectory)).length>0);
await fs.mkdir(request.outputDirectory,{recursive:true});
await fs.writeFile(path.join(request.outputDirectory,'adapter-proof'),'metadata-only');
`
  );
  const result = await compareScenario(
    definitions.find((item) => item.id === 'wire-names'),
    oracle,
    { mode: 'metadata', adapter: [process.execPath, adapter] }
  );
  assert.equal(result.status, 'mismatch', JSON.stringify(result));
  assert.equal(result.sourceFilesUnavailable, true);
  assert.deepEqual(result.comparison.extra, ['adapter-proof']);
});

test('an unavailable metadata adapter is reported as failure, with no legacy fallback', async () => {
  const result = await compareScenario(
    definitions.find((item) => item.id === 'wire-names'),
    oracle,
    {
      mode: 'metadata',
      adapter: [
        process.execPath,
        '-e',
        'process.stderr.write("Native backend unavailable");process.exitCode=1',
        '--'
      ]
    }
  );
  assert.equal(result.status, 'candidate-generation-failed');
  assert.equal(result.candidateRun.stage, 'metadata-generation');
  assert.match(result.candidateRun.stderr, /Native backend unavailable/);
});

test('candidate command failure cannot become a matching empty tree', async () => {
  const result = await compareScenario(
    definitions.find((item) => item.id === 'default'),
    oracle,
    { candidateCommand: [process.execPath, '-e', 'process.exit(7)', '--'] }
  );
  assert.equal(result.status, 'candidate-generation-failed');
  assert.equal(result.candidateRun.code, 7);
});

test('external schemas outside the original schema root remain an explicit oracle failure', async () => {
  const scenario = structuredClone(
    definitions.find((item) => item.id === 'external')
  );
  scenario.files = Object.fromEntries(
    Object.entries(scenario.files).map(([name, data]) => [
      name.replace(/^source\//, ''),
      data
    ])
  );
  const result = await compareScenario(scenario, oracle, { mode: 'oracle' });
  assert.equal(result.status, 'reference-generation-failed');
  assert.match(result.referenceRun.stderr, /Path does not include root dir/);
});

test('C-style block comments are rejected by the pinned original parser', async () => {
  const result = await compareScenario(
    {
      id: 'unsupported-block-comment',
      entry: 'block-comment',
      files: {
        'source/block-comment': '/* comment */\nexport type Value { int id; }\n'
      }
    },
    oracle,
    { mode: 'oracle' }
  );
  assert.equal(result.status, 'reference-generation-failed');
  assert.match(result.referenceRun.stderr, /Unexpected \//);
});
