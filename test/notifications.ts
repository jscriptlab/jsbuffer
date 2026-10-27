import test from 'ava';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import testFinished from '../scripts/slack-messages/testFinished';

test('notifications: PR payloads have nonempty sections and fallback text', (t) => {
  const payload = testFinished(
    {
      pull_request: {
        title: 'Fix <schema> & defaults',
        html_url: 'https://github.com/jscriptlab/jsbuffer/pull/37',
        user: { login: 'author' },
        head: { ref: 'fix/schema', sha: '1234567890' }
      }
    },
    {}
  );
  t.true(payload.text.length > 0);
  t.true(JSON.stringify(payload).includes('Fix &lt;schema&gt; &amp; defaults'));
  for (const block of payload.blocks) {
    if (block.type === 'section' && block.text)
      t.true(block.text.text.trim().length > 0);
  }
  t.false(JSON.stringify(payload).includes('undefined'));
});

test('notifications: push payloads retain commit context and actual result', (t) => {
  const payload = testFinished(
    {
      pusher: { name: 'author' },
      ref: 'refs/heads/develop',
      head_commit: {
        id: 'abcdef1234',
        message: 'Commit title',
        timestamp: '2026-10-26T00:00:00Z'
      }
    },
    { TEST_RESULT: 'failure' }
  );
  t.true(payload.text.startsWith('Tests failure'));
  t.true(JSON.stringify(payload).includes('Commit title'));
  t.true(JSON.stringify(payload).includes('2026-10-26T00:00:00Z'));
});

test('notifications: absent optional fields still produce a valid text payload', (t) => {
  const payload = testFinished({}, {});
  t.true(payload.text.length > 0);
  for (const block of payload.blocks) {
    if (block.type === 'section' && block.text)
      t.true(block.text.text.trim().length > 0);
  }
});

test('notifications: --dump-json succeeds without Slack credentials or delivery', async (t) => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), 'jsb-notification-')
  );
  try {
    const event = path.join(directory, 'event.json');
    await fs.writeFile(
      event,
      JSON.stringify({ pull_request: { title: 'Pull request title' } })
    );
    const run = spawnSync(
      process.execPath,
      [
        path.resolve(__dirname, '../scripts/notify.js'),
        '--notification-type',
        'test-finished',
        '--dump-json'
      ],
      {
        env: { PATH: process.env['PATH'], GITHUB_EVENT_PATH: event },
        encoding: 'utf8',
        timeout: 5000
      }
    );
    t.is(run.status, 0, run.stderr);
    t.true(JSON.parse(run.stdout).text.length > 0);
    t.true(run.stdout.includes('Pull request title'));
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
