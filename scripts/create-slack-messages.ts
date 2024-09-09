import path from 'path';
import * as testFinishedSlackMessage from './test-finished-slack-message.json';
import fs from 'fs';

function parseJSON<T>(value: string | null): T {
  if (value === null) {
    throw new Error('Value is null');
  }
  return JSON.parse(value);
}

function makeList(values: string[]) {
  return values.map((file) => `- ${file}`).join('\n');
}

const workflowsDir = path.resolve(
  __dirname,
  '../.github/workflows/test-finished-slack-message.json'
);

(async () => {
  console.log(process.env['COMMIT_ADDED_FILES']);
  console.log(process.env['COMMIT_MODIFIED_FILES']);
  console.log(process.env['COMMIT_REMOVED_FILES']);
  console.log(process.env['COMMIT_TIMESTAMP']);
  const addedFiles = makeList(
    parseJSON<string[]>(process.env['COMMIT_ADDED_FILES'] ?? null)
  );
  const modifiedFiles = makeList(
    parseJSON<string[]>(process.env['COMMIT_MODIFIED_FILES'] ?? null)
  );
  const removedFiles = makeList(
    parseJSON<string[]>(process.env['COMMIT_REMOVED_FILES'] ?? null)
  );
  testFinishedSlackMessage.blocks.push(
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Files added*\n\n${addedFiles}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Modified files*\n\n${modifiedFiles}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Removed files*\n\n${removedFiles}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${process.env['COMMIT_TIMESTAMP']}`
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
