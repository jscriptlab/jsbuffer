import { SayArguments } from '@slack/bolt';

const testFinishedSlackMessagePayload: SayArguments = {
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

export default testFinishedSlackMessagePayload;
