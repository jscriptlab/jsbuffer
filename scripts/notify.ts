import { App } from '@slack/bolt';
import { ChatPostMessageArguments } from '@slack/web-api';
import * as testFinished from './slack-messages/testFinished';
import env from './env';
import { getString } from 'cli-argument-helper/string';
import getNamedArgument from 'cli-argument-helper/getNamedArgument';
import { getArgument } from 'cli-argument-helper';
import assert from 'node:assert';

(async () => {
  const args = process.argv.slice(2);

  const app = new App({
    signingSecret: env('SLACK_SIGNING_SECRET'),
    token: env('SLACK_BOT_TOKEN')
  });

  const notificationType = getNamedArgument(
    args,
    '--notification-type',
    getString
  );

  assert.strict.ok(
    notificationType !== null,
    '--notification-type is required'
  );

  let chatPostMessageArguments: ChatPostMessageArguments;

  const channel = 'jsbuffer';

  switch (notificationType) {
    case 'test-finished':
      chatPostMessageArguments = {
        channel,
        blocks: testFinished.blocks(),
        text: testFinished.text()
      };
      break;

    default:
      console.error(`Invalid notification type: ${notificationType}`);
      process.exit(1);
  }

  if (getArgument(args, '--dump-json') !== null) {
    process.stdout.write(JSON.stringify(chatPostMessageArguments));
    process.exitCode = 0;
    return;
  }

  await app.start(3000);

  await app.client.chat.postMessage({
    ...chatPostMessageArguments
  });

  await app.stop();
})().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
