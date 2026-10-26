import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { root, run } from '../../tools/fidelity/core.mjs';

test('CLI writes matching and failed reports and returns the corresponding exit status', async (t) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'jsb-fidelity-cli-')
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const cli = path.join(root, 'tools/fidelity/cli.mjs');
  const good = path.join(directory, 'matching.json');
  const matched = await run([
    process.execPath,
    cli,
    'compare',
    '--mode',
    'oracle',
    '--scenarios',
    'wire-names',
    '--report',
    good
  ]);
  assert.equal(matched.code, 0, matched.stderr + matched.stdout);
  assert.equal(JSON.parse(await fs.readFile(good, 'utf8')).passed, true);
  const bad = path.join(directory, 'failed.json');
  const failed = await run([
    process.execPath,
    cli,
    'compare',
    '--mode',
    'metadata',
    '--scenarios',
    'wire-names',
    '--report',
    bad,
    '--adapter',
    JSON.stringify([process.execPath, '-e', 'process.exit(7)', '--'])
  ]);
  assert.equal(failed.code, 1, failed.stderr + failed.stdout);
  const report = JSON.parse(await fs.readFile(bad, 'utf8'));
  assert.equal(report.passed, false);
  assert.equal(report.results[0].candidateRun.code, 7);
});

test('CLI rejects unknown modes and malformed adapter commands', async () => {
  for (const args of [
    ['compare', '--mode', 'unknown'],
    ['compare', '--mode', 'metadata', '--adapter', '"shell command"']
  ]) {
    const result = await run([
      process.execPath,
      path.join(root, 'tools/fidelity/cli.mjs'),
      ...args
    ]);
    assert.equal(result.code, 1);
  }
});
