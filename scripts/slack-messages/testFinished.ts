import type { KnownBlock } from '@slack/bolt';

export interface NotificationEvent {
  repository?: { html_url?: string; full_name?: string };
  sender?: { login?: string };
  pusher?: { name?: string; email?: string };
  head_commit?: {
    id?: string;
    message?: string;
    url?: string;
    timestamp?: string;
  };
  pull_request?: {
    number?: number;
    title?: string;
    html_url?: string;
    user?: { login?: string };
    head?: { sha?: string; ref?: string };
  };
  ref?: string;
  compare?: string;
  forced?: boolean;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default function testFinished(
  event: NotificationEvent = {},
  environment: NodeJS.ProcessEnv = process.env
): { text: string; blocks: KnownBlock[] } {
  const pr = event.pull_request;
  const result = environment['TEST_RESULT'] ?? 'success';
  const title = result === 'success' ? 'Tests passed ✅' : 'Tests ' + result;
  const actor =
    pr?.user?.login ||
    event.pusher?.name ||
    event.sender?.login ||
    environment['TRIGGERING_ACTOR'] ||
    environment['GITHUB_ACTOR'] ||
    'Unknown actor';
  const ref =
    pr?.head?.ref ||
    event.ref ||
    environment['EVENT_REF'] ||
    environment['GITHUB_HEAD_REF'] ||
    environment['GITHUB_REF'] ||
    'unknown branch';
  const sha =
    pr?.head?.sha ||
    event.head_commit?.id ||
    environment['EVENT_HEAD_COMMIT_ID'] ||
    environment['GITHUB_SHA'] ||
    'unknown commit';
  const message =
    pr?.title ||
    event.head_commit?.message ||
    environment['EVENT_HEAD_COMMIT_MESSAGE'] ||
    'No commit message provided';
  const url =
    pr?.html_url ||
    event.head_commit?.url ||
    environment['EVENT_HEAD_COMMIT_URL'];
  const blocks: KnownBlock[] = [
    { type: 'header', text: { type: 'plain_text', text: title } }
  ];
  const section = (text: string) =>
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: escape(text).slice(0, 3000) }
    });
  section(actor + ' · ' + ref + ' · ' + sha.slice(0, 7));
  section(message);
  if (url && /^https:\/\//.test(url)) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          '<' +
          encodeURI(url).replace(/\|/g, '%7C') +
          '|' +
          (pr ? 'Pull request' : 'Commit') +
          '>'
      }
    });
  }
  const timestamp =
    event.head_commit?.timestamp || environment['EVENT_HEAD_COMMIT_TIMESTAMP'];
  if (timestamp?.trim()) section(timestamp);
  if (event.forced === true || environment['COMMIT_FORCED'] === 'true')
    section('This commit was forced');
  return { text: title + ': ' + ref + ' (' + sha.slice(0, 7) + ')', blocks };
}
