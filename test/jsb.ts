import test from 'ava';
import { spawn } from 'child-process-utilities';
import path from 'path';

test('it should successfully generate a CMake C++ project', async (t) => {
  await spawn('node', [
    path.resolve(__dirname, '../cli/jsb'),
    'test/parser/index.jsb',
    '-o',
    path.resolve(__dirname, 'generated/cpp')
  ]).wait();
  t.pass();
});