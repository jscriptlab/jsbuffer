import { App, KnownBlock, Block } from '@slack/bolt';
import testFinished from './slack-messages/testFinished';
import env from './env';
import { getString } from 'cli-argument-helper/string';
import getNamedArgument from 'cli-argument-helper/getNamedArgument';

(async () => {
  const args = process.argv.slice(2);
  const app = new App({
    signingSecret: env('SLACK_SIGNING_SECRET'),
    token: env('SLACK_BOT_TOKEN')
  });

  await app.start(3000);
  const notificationType = getNamedArgument(
    args,
    '--notification-type',
    getString
  );

  let blocks: (KnownBlock | Block)[] = [];

  switch (notificationType) {
    case 'test-finished':
      blocks = testFinished();
      break;

    default:
      console.error(`Invalid notification type: ${notificationType}`);
      process.exit(1);
  }

  await app.client.chat.postMessage({
    channel: 'jsbuffer',
    blocks
  });

  await app.stop();
})().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
