import { SayArguments } from '@slack/bolt';
import env from '../env';

const initialPayload = ({
  EVENT_HEAD_COMMIT_TIMESTAMP,
  EVENT_PUSHER_EMAIL,
  EVENT_HEAD_COMMIT_URL,
  EVENT_PUSHER_NAME,
  EVENT_HEAD_COMMIT_MESSAGE,
  EVENT_HEAD_COMMIT_ID
}: Context): SayArguments => ({
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
        text: `<${EVENT_HEAD_COMMIT_URL}|${EVENT_HEAD_COMMIT_ID}>`,
        type: 'mrkdwn'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${EVENT_HEAD_COMMIT_MESSAGE}`
      }
    },
    {
      type: 'section',
      text: {
        text: `${EVENT_PUSHER_NAME} <${EVENT_PUSHER_EMAIL}>`,
        type: 'mrkdwn'
      }
    },
    {
      type: 'section',
      text: {
        text: EVENT_HEAD_COMMIT_TIMESTAMP,
        type: 'mrkdwn'
      }
    }
  ]
});

function context() {
  return {
    EVENT_HEAD_COMMIT_MESSAGE: env('EVENT_HEAD_COMMIT_MESSAGE'),
    EVENT_HEAD_COMMIT_URL: env('EVENT_HEAD_COMMIT_URL'),
    EVENT_HEAD_COMMIT_TIMESTAMP: env('EVENT_HEAD_COMMIT_TIMESTAMP'),
    EVENT_HEAD_COMMIT_ID: env('EVENT_HEAD_COMMIT_ID'),
    EVENT_PUSHER_NAME: env('EVENT_PUSHER_NAME'),
    EVENT_PUSHER_EMAIL: env('EVENT_PUSHER_EMAIL'),
    EVENT_REF: env('EVENT_REF'),
    EVENT_COMPARE_URL: env('EVENT_COMPARE_URL'),
    EVENT_BEFORE_COMMIT: env('EVENT_BEFORE_COMMIT'),
    EVENT_AFTER_COMMIT: env('EVENT_AFTER_COMMIT')
  };
}

type Context = ReturnType<typeof context>;

export default () => {
  const {
    EVENT_HEAD_COMMIT_URL,
    EVENT_REF,
    EVENT_COMPARE_URL,
    EVENT_BEFORE_COMMIT,
    EVENT_AFTER_COMMIT,
    EVENT_PUSHER_NAME
  } = context();
  let blocks = initialPayload(context()).blocks ?? null;
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
