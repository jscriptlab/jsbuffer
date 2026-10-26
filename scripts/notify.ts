import { App } from '@slack/bolt';
import { readFileSync } from 'node:fs';
import testFinished, { NotificationEvent } from './slack-messages/testFinished';
import env from './env';
import { getString } from 'cli-argument-helper/string';
import getArgumentAssignment from 'cli-argument-helper/getArgumentAssignment';

(async () => {
  const args = process.argv.slice(2);
  const notificationType = getArgumentAssignment(
    args,
    '--notification-type',
    getString
  );
  if (notificationType !== 'test-finished')
    throw new Error('Invalid notification type: ' + notificationType);
  const eventPath = process.env['GITHUB_EVENT_PATH'];
  const event: NotificationEvent = eventPath
    ? JSON.parse(readFileSync(eventPath, 'utf8'))
    : {};
  const payload = testFinished(event);
  // A dry run needs no credentials and never constructs a Slack client.
  if (args.includes('--dump-json')) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  const app = new App({
    signingSecret: env('SLACK_SIGNING_SECRET'),
    token: env('SLACK_BOT_TOKEN')
  });
  await app.client.chat.postMessage({ channel: 'jsbuffer', ...payload });
})().catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
