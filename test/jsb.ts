import test from 'ava';
import { spawn } from 'child-process-utilities';
import { glob } from 'glob';
import path from 'path';

test('it should successfully generate a CMake C and C++ project', async (t) => {
  await spawn('node', [
    path.resolve(__dirname, '../cli/jsb'),
    'test/parser/test_schema.jsb',
    '-o',
    path.resolve(__dirname, 'generated/cpp')
  ]).wait();

  await spawn('node', [
    path.resolve(__dirname, '../cli/jsb'),
    'src/generators/c/test/app.jsb',
    '--name',
    'app',
    '--generator',
    'c99',
    '-o',
    path.resolve(__dirname, 'generated/c')
  ]).wait();

  const buildDir = path.resolve(__dirname, '../build');

  await spawn('cmake', [
    '-B',
    buildDir,
    '-S',
    path.resolve(__dirname, '..'),
    '--fresh'
  ]).wait();
  await spawn('cmake', ['--build', buildDir]).wait();

  const testExecutables = ['app_test', 'jsb_codec_test'];

  const testFiles = await glob(path.resolve(buildDir, '**/*_test'));

  for (const testFile of testFiles) {
    if (!testExecutables.includes(path.basename(testFile))) {
      continue;
    }
    await spawn(testFile).wait();
  }

  t.pass();
});
