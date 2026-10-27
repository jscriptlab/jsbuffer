import test from 'ava';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateWithVirtualFs } from '../helpers';

const root = path.resolve(__dirname, '..');

function run(args: string[]) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 60000
  });
  if (result.error) throw result.error;
  return { status: result.status, output: result.stdout + result.stderr };
}

test('generated fixtures use locked tooling and isolate ambient types', async (t) => {
  const project = await generateWithVirtualFs({
    mainFile: 'words',
    paths: { words: 'export type Words { int16 signed; uint16 unsigned; }' }
  });
  try {
    await t.throwsAsync(fs.access(path.join(project.rootDir, 'node_modules')));
    const manifest = JSON.parse(
      await fs.readFile(path.join(project.rootDir, 'package.json'), 'utf8')
    );
    for (const name of ['typescript', 'nyc', '@jsbuffer/codec']) {
      t.is(
        manifest.devDependencies[name],
        require(`${name}/package.json`).version
      );
    }
    await project.fileGenerator.generate();
    const config = JSON.parse(
      await fs.readFile(path.join(project.outDir, 'tsconfig.json'), 'utf8')
    );
    t.deepEqual(config.compilerOptions.types, []);
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
    t.is(result.status, 0, result.output);
    await fs.appendFile(
      path.join(project.outDir, 'words.ts'),
      'const invalid: number = "invalid";\n'
    );
    result = run(args);
    t.is(result.status, 2, result.output);
    t.regex(result.output, /not assignable to type 'number'/);
  } finally {
    await fs.rm(project.rootDir, { recursive: true, force: true });
  }
});

test('nested fixture coverage remains isolated and enforces its threshold', async (t) => {
  const directory = await fs.mkdtemp(path.join(root, '.fixture-coverage-'));
  try {
    const file = path.join(directory, 'probe.cjs');
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
      process.execPath,
      file
    ];
    for (const failCoverage of [false, true]) {
      const paths: Record<string, string> = {
        main: 'export type Value { int value; }'
      };
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
        `const fs = require('node:fs/promises');
const { generateWithVirtualFs } = require(${JSON.stringify(
          path.join(root, 'helpers/index.js')
        )});
(async () => {
  const project = await generateWithVirtualFs({ mainFile: 'main', paths: ${JSON.stringify(
    paths
  )} });
  try { await project.test(); }
  finally { await fs.rm(project.rootDir, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
`
      );
      const result = run(args);
      t.is(result.status, failCoverage ? 1 : 0, result.output);
      if (failCoverage)
        t.regex(result.output, /does not meet global threshold \(100%\)/);
    }
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
