import { SayArguments } from '@slack/bolt';
import env from '../env';

const initialPayload: SayArguments = {
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Tests passed ✅'
      }
    },
    {
      type: 'section',
      text: {
        text: '<${{ github.event.head_commit.url }}|${{ github.event.head_commit.id }}>',
        type: 'mrkdwn'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '${{ github.event.head_commit.message }}'
      }
    },
    {
      type: 'section',
      text: {
        text: '${{ github.event.head_commit.author.name }} <${{ github.event.head_commit.author.email }}>',
        type: 'mrkdwn'
      }
    },
    {
      type: 'section',
      text: {
        text: '${{ github.event.head_commit.timestamp }}',
        type: 'mrkdwn'
      }
    }
  ]
};

export default () => {
  const EVENT_PUSHER_NAME = env('EVENT_PUSHER_NAME');
  const EVENT_HEAD_COMMIT_URL = env('EVENT_HEAD_COMMIT_URL');
  const EVENT_REF = env('EVENT_REF');
  const EVENT_COMPARE_URL = env('EVENT_COMPARE_URL');
  const EVENT_BEFORE_COMMIT = env('EVENT_BEFORE_COMMIT');
  const EVENT_AFTER_COMMIT = env('EVENT_AFTER_COMMIT');

  let blocks = initialPayload.blocks ?? null;
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

  return blocks;
};
