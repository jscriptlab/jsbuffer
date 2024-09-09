import path from 'path';
import * as testFinishedSlackMessage from './test-finished-slack-message.json';
import fs from 'fs';

// function parseJSON<T>(value: string | null): T {
//   if (value === null) {
//     throw new Error('Value is null');
//   }
//   return JSON.parse(value);
// }

// function makeList(values: string[]) {
//   return values.map((file) => `- ${file}`).join('\n');
// }

function getString(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string');
  }
  return value;
}

const workflowsDir = path.resolve(__dirname, '../.github/workflows');

(async () => {
  const EVENT_PUSHER_NAME = getString(process.env['EVENT_PUSHER_NAME']);
  // const EVENT_HEAD_COMMIT_ID = getString(process.env['EVENT_HEAD_COMMIT_ID']);
  // const EVENT_HEAD_COMMIT_MESSAGE = getString(process.env['EVENT_HEAD_COMMIT_MESSAGE']);
  // const EVENT_HEAD_COMMIT_TIMESTAMP = getString(process.env['EVENT_HEAD_COMMIT_TIMESTAMP']);
  const EVENT_HEAD_COMMIT_URL = getString(process.env['EVENT_HEAD_COMMIT_URL']);
  const EVENT_REF = getString(process.env['EVENT_REF']);
  const EVENT_COMPARE_URL = getString(process.env['EVENT_COMPARE_URL']);
  const EVENT_BEFORE_COMMIT = getString(process.env['EVENT_BEFORE_COMMIT']);
  const EVENT_AFTER_COMMIT = getString(process.env['EVENT_AFTER_COMMIT']);
  testFinishedSlackMessage.blocks.push(
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
        text: `<${EVENT_COMPARE_URL}|${EVENT_BEFORE_COMMIT.substr(
          0,
          7
        )}...${EVENT_AFTER_COMMIT.substr(0, 7)}>`
      }
    },
    // ! Maybe convert `test-finished-slack-message.json` to a `.ts` file
    {
      type: 'divider'
    } as unknown as any,
    {
      type: 'section',
      text: {
        text: 'Triggered by **${{ github.triggering_actor }}**',
        type: 'mrkdwn'
      }
    }
  );
  if (process.env['COMMIT_FORCED'] ?? null) {
    testFinishedSlackMessage.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '**This commit was forced**'
      }
    });
  }
  await fs.promises.writeFile(
    path.resolve(workflowsDir, 'test-finished-slack-message.json'),
    JSON.stringify(testFinishedSlackMessage, null, 2)
  );
})().catch((reason) => {
  console.error(reason);
  process.exit(1);
});
