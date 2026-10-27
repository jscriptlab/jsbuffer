const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const files = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  [
    require.resolve('sarg'),
    '--bail',
    '--require',
    'ts-node/register',
    '--reporter',
    path.join(__dirname, 'infrastructure/exit-code-reporter.cjs'),
    ...(files.length
      ? files.map((file) => path.relative(root, path.resolve(file)))
      : ['test/**/*.ts']),
    '--ignore',
    'test/**/*.d.ts'
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      TS_NODE_PROJECT: path.join(__dirname, 'tsconfig.json')
    },
    stdio: 'inherit'
  }
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
