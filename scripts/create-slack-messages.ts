// import path from 'path';
import fs from 'fs';
// import { App } from '@slack/bolt';
// import { DateTime } from 'luxon';
import testFinishedSlackMessagePayload from './slack-messages/testFinishedSlackMessage';
import path from 'path';

// function parseJSON<T>(value: string | null): T {
//   if (value === null) {
//     throw new Error('Value is null');
//   }
//   return JSON.parse(value);
// }

// function makeList(values: string[]) {
//   return values.map((file) => `- ${file}`).join('\n');
// }

function env(key: string) {
  const value = process.env[key];
  if (typeof value !== 'string') {
    throw new Error(`Missing ${key} environment variable.`);
  }
  return value;
}

const slackMessagesOutDir = path.resolve(
  __dirname,
  '../.github/workflows/slack-messages'
);
// const workflowsDir = path.resolve(__dirname, '../.github/workflows');

(async () => {
  // const app = new App({
  //   signingSecret: env('SLACK_SIGNING_SECRET'),
  //   token: env('SLACK_BOT_TOKEN')
  // });

  // await app.start(3000);

  const EVENT_PUSHER_NAME = env('EVENT_PUSHER_NAME');
  // const EVENT_HEAD_COMMIT_ID = getString('EVENT_HEAD_COMMIT_ID');
  // const EVENT_HEAD_COMMIT_MESSAGE = getString('EVENT_HEAD_COMMIT_MESSAGE');
  // const EVENT_HEAD_COMMIT_TIMESTAMP = getString('EVENT_HEAD_COMMIT_TIMESTAMP');
  const EVENT_HEAD_COMMIT_URL = env('EVENT_HEAD_COMMIT_URL');
  const EVENT_REF = env('EVENT_REF');
  const EVENT_COMPARE_URL = env('EVENT_COMPARE_URL');
  const EVENT_BEFORE_COMMIT = env('EVENT_BEFORE_COMMIT');
  const EVENT_AFTER_COMMIT = env('EVENT_AFTER_COMMIT');

  let blocks = testFinishedSlackMessagePayload.blocks ?? null;
  if (!Array.isArray(blocks)) {
    throw new Error('blocks is not an array');
  }
  if (blocks === null) {
    blocks = [];
  }
  blocks.push(
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${EVENT_PUSHER_NAME} <${EVENT_HEAD_COMMIT_URL}|pushed> to <${EVENT_REF}|${EVENT_REF.replace(
          'refs/heads/',
          ''
        )}>`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${EVENT_COMPARE_URL}|${EVENT_BEFORE_COMMIT.substring(
          0,
          7
        )}...${EVENT_AFTER_COMMIT.substring(0, 7)}>`
      }
    },
    // ! Maybe convert `test-finished-slack-message.json` to a `.ts` file
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        text: 'Triggered by **${{ github.triggering_actor }}**',
        type: 'mrkdwn'
      }
    }
  );
  if ('COMMIT_FORCED' in process.env) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '**This commit was forced**'
      }
    });
  }

  // await app.client.chat.postMessage({
  //   channel: 'jsbuffer',
  //   blocks
  // });

  // console.log(1);

  await fs.promises.writeFile(
    path.resolve(slackMessagesOutDir, 'testFinishedSlackMessage.json'),
    JSON.stringify(testFinishedSlackMessagePayload, null, 2)
  );
})().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
