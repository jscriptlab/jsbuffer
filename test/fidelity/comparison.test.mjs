import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compareTrees, readTree, run } from '../../tools/fidelity/core.mjs';

test('identical raw byte trees match, including binary and empty files', () => {
  const data = new Map([
    ['binary', Buffer.from([0, 255, 128])],
    ['empty', Buffer.alloc(0)]
  ]);
  assert.equal(compareTrees(data, new Map(data)).equal, true);
});

test('missing and extra files fail independently of matching files', () => {
  const expected = new Map([
    ['a', Buffer.from('a')],
    ['nested/b', Buffer.from('b')]
  ]);
  const actual = new Map([
    ['a', Buffer.from('a')],
    ['extra', Buffer.alloc(0)]
  ]);
  const result = compareTrees(expected, actual);
  assert.equal(result.equal, false);
  assert.deepEqual(result.missing, ['nested/b']);
  assert.deepEqual(result.extra, ['extra']);
});

test('one-byte changes include the exact offset and file identities', () => {
  const result = compareTrees(
    new Map([['x', Buffer.from([0, 1, 255])]]),
    new Map([['x', Buffer.from([0, 2, 255])]])
  );
  assert.equal(result.equal, false);
  assert.equal(result.changed[0].firstDifferentByte, 1);
  assert.notEqual(
    result.changed[0].expected.sha256,
    result.changed[0].actual.sha256
  );
});

for (const [name, left, right] of [
  ['line endings', 'a\n', 'a\r\n'],
  ['trailing newline', 'a\n', 'a'],
  ['spaces', 'a b', 'a  b'],
  ['JSON order', '{"a":1,"b":2}', '{"b":2,"a":1}'],
  ['UTF-8 bytes', Buffer.from([0xff]), Buffer.from([0xfe])]
])
  test(name + ' are not normalized', () => {
    assert.equal(
      compareTrees(
        new Map([['x', Buffer.from(left)]]),
        new Map([['x', Buffer.from(right)]])
      ).equal,
      false
    );
  });

test('an empty reference fails rather than accepting empty output', () => {
  assert.throws(() => compareTrees(new Map(), new Map()), /empty reference/);
});

test('directory inventory preserves nested filenames and rejects symbolic links', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'jsb-tree-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'nested'));
  await fs.writeFile(path.join(directory, 'nested/Empty.ts'), '');
  assert.deepEqual(
    [...(await readTree(directory))].map(([name]) => name),
    ['nested/Empty.ts']
  );
  await fs.symlink('nested/Empty.ts', path.join(directory, 'link'));
  await assert.rejects(readTree(directory), /not links/);
});

test('failed and timed-out commands retain their non-success result', async () => {
  const failed = await run([
    process.execPath,
    '-e',
    'process.stderr.write("failure"); process.exitCode=7'
  ]);
  assert.equal(failed.code, 7);
  assert.equal(failed.stderr, 'failure');
  const timeout = await run(
    [process.execPath, '-e', 'setInterval(()=>{},1000)'],
    { timeoutMs: 100 }
  );
  assert.equal(timeout.timedOut, true);
  assert.notEqual(timeout.code, 0);
  const gracefulTimeout = await run(
    [
      process.execPath,
      '-e',
      'process.on("SIGTERM",()=>process.exit(0));setInterval(()=>{},1000)'
    ],
    { timeoutMs: 300 }
  );
  assert.equal(gracefulTimeout.timedOut, true);
  assert.equal(gracefulTimeout.ok, false);
});
