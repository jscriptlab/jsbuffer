const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');

async function fixture(t, source) {
  const directory = await fs.mkdtemp(path.join(root, '.runner-status-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'suite.cjs');
  await fs.writeFile(file, source);
  return { directory, file };
}

function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return { status: result.status, output: result.stdout + result.stderr };
}

const suite = (body) => `const { Suite } = require('sarg');
const suite = new Suite();
${body}
module.exports.default = suite;
`;

for (const [name, body] of [
  ['passing test', "suite.test('passing sentinel', () => {});"],
  [
    'assertion failure',
    "suite.test('failure sentinel', () => { require('node:assert/strict').equal(1, 2); });"
  ],
  [
    'rejected promise',
    "suite.test('failure sentinel', async () => { throw new Error('rejection sentinel'); });"
  ],
  [
    'failed child process',
    "suite.test('failure sentinel', () => { require('node:child_process').execFileSync(process.execPath, ['-e', 'process.exit(2)']); });"
  ],
  ...['before', 'after', 'beforeEach', 'afterEach'].map((hook) => [
    `${hook} failure`,
    `suite.${hook}(() => { throw new Error('hook sentinel'); }); suite.test('passing sentinel', () => {});`
  ]),
  ['empty suite', '']
]) {
  test(`test command preserves ${name} status`, async (t) => {
    const { file } = await fixture(t, suite(body));
    const result = run(['test/run.cjs', file]);
    assert.equal(result.status, name === 'passing test' ? 0 : 1, result.output);
    assert.match(result.output, /SUMMARY:/);
  });
}

test('test command fails on a suite import error', async (t) => {
  const { file } = await fixture(t, "throw new Error('import sentinel');\n");
  const result = run(['test/run.cjs', file]);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /import sentinel/);
});

test('test command fails when no files match', () => {
  const result = run(['test/run.cjs', '.no-such-tests/*.ts']);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /No tests were executed/);
});

test('coverage preserves both passing and failing test status', async (t) => {
  const { directory, file } = await fixture(
    t,
    suite("suite.test('coverage sentinel', () => {});")
  );
  const config = path.join(directory, '.nycrc.json');
  await fs.writeFile(
    config,
    JSON.stringify({ all: false, 'check-coverage': false })
  );
  const args = [
    require.resolve('nyc/bin/nyc.js'),
    '--nycrc-path',
    config,
    '--temp-dir',
    path.join(directory, 'coverage'),
    '--silent',
    'npm',
    'test',
    '--',
    file
  ];
  let result = run(args);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /1 tests completed/);
  await fs.writeFile(
    file,
    suite(
      "suite.test('coverage sentinel', () => { throw new Error('coverage failure sentinel'); });"
    )
  );
  result = run(args);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /coverage failure sentinel/);
});

test('generated fixtures use locked tooling and exclude unrelated ambient types', async (t) => {
  require('ts-node').register({
    project: path.join(root, 'test/tsconfig.json')
  });
  const { generateWithVirtualFs } = require('../../helpers/index.ts');
  const project = await generateWithVirtualFs({
    mainFile: 'words',
    paths: { words: 'export type Words { int16 signed; uint16 unsigned; }' }
  });
  t.after(() => fs.rm(project.rootDir, { recursive: true, force: true }));
  await assert.rejects(fs.access(path.join(project.rootDir, 'node_modules')));
  const manifest = JSON.parse(
    await fs.readFile(path.join(project.rootDir, 'package.json'), 'utf8')
  );
  for (const name of ['typescript', 'nyc', '@jsbuffer/codec']) {
    assert.equal(
      manifest.devDependencies[name],
      require(`${name}/package.json`).version
    );
  }
  await project.fileGenerator.generate();
  const config = JSON.parse(
    await fs.readFile(path.join(project.outDir, 'tsconfig.json'), 'utf8')
  );
  assert.deepEqual(config.compilerOptions.types, []);
  const poison = path.join(
    project.rootDir,
    'node_modules/@types/ambient-poison'
  );
  await fs.mkdir(poison, { recursive: true });
  await fs.writeFile(
    path.join(poison, 'index.d.ts'),
    'type Poison = UndeclaredAmbientType;\n'
  );
  const args = [
    require.resolve('typescript/bin/tsc'),
    '--project',
    path.join(project.outDir, 'tsconfig.json')
  ];
  let result = run(args);
  assert.equal(result.status, 0, result.output);
  await fs.appendFile(
    path.join(project.outDir, 'words.ts'),
    'const invalid: number = "invalid";\n'
  );
  result = run(args);
  assert.equal(result.status, 2, result.output);
  assert.match(result.output, /not assignable to type 'number'/);
});

test('nested fixture coverage is isolated and still enforces its threshold', async (t) => {
  const { directory, file } = await fixture(t, '');
  const config = path.join(directory, '.nycrc.json');
  await fs.writeFile(
    config,
    JSON.stringify({ all: false, 'check-coverage': false })
  );
  const args = [
    require.resolve('nyc/bin/nyc.js'),
    '--cwd',
    root,
    '--nycrc-path',
    config,
    '--temp-dir',
    path.join(directory, 'outer-coverage'),
    '--silent',
    'npm',
    'test',
    '--',
    file
  ];
  for (const failCoverage of [false, true]) {
    const paths = { main: 'export type Value { int value; }' };
    if (failCoverage) {
      paths['uncovered.js'] = 'module.exports = () => 1;';
      paths['.nycrc'] = JSON.stringify({
        all: true,
        include: ['uncovered.js'],
        lines: 100
      });
    }
    await fs.writeFile(
      file,
      suite(`suite.test('nested coverage sentinel', async () => {
      const fs = require('node:fs/promises');
      const { generateWithVirtualFs } = require(${JSON.stringify(
        path.join(root, 'helpers/index.ts')
      )});
      const project = await generateWithVirtualFs({ mainFile: 'main', paths: ${JSON.stringify(
        paths
      )} });
      try { await project.test(); }
      finally { await fs.rm(project.rootDir, { recursive: true, force: true }); }
    });`)
    );
    const result = run(args);
    assert.equal(result.status, failCoverage ? 1 : 0, result.output);
    if (failCoverage)
      assert.match(result.output, /does not meet global threshold \(100%\)/);
  }
});
