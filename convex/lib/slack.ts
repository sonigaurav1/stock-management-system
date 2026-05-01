'use node';

/**
 * Slack Integration
 * Posts messages and notifications to Slack channels
 *
 * Install: npm install @slack/bolt
 * Environment: SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET
 */

import { App } from '@slack/bolt';

let app: App | null = null;

const initSlack = () => {
  if (!app) {
    app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET
    });
  }
  return app;
};

export interface SlackMessagePayload {
  channel: string;
  text?: string;
  blocks?: any[];
  thread_ts?: string;
}

export const postSlackMessage = async (payload: SlackMessagePayload) => {
  try {
    const app = initSlack();

    const result = await app.client.chat.postMessage({
      channel: payload.channel,
      text: payload.text || 'Update',
      blocks: payload.blocks,
      thread_ts: payload.thread_ts
    });

    console.debug(`Slack message sent to ${payload.channel}`);
    return {
      success: true,
      messageId: result.ts
    };
  } catch (error) {
    console.error('Slack message failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Formatted message blocks for different scenarios
 */
export const slackMessageBlocks = {
  lowStockAlert: (productName: string, stock: number, reorderLevel: number) => [
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*⚠️ Low Stock Alert*\n${'_' + productName + '_'}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Current Stock*\n${stock} units`
        },
        {
          type: 'mrkdwn',
          text: `*Reorder Level*\n${reorderLevel} units`
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📦 Reorder Now'
          },
          url: `${process.env.APP_URL}/products/${productName}`
        }
      ]
    }
  ],

  orderConfirmation: (orderId: string, items: number, total: number) => [
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*✅ Order Confirmed*\nOrder #${orderId}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Items*\n${items} product(s)`
        },
        {
          type: 'mrkdwn',
          text: `*Total*\n₹${total.toFixed(2)}`
        }
      ]
    }
  ],

  paymentAlert: (invoiceNumber: string, status: string, amount: number) => [
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💰 Payment ${status}*\nInvoice #${invoiceNumber}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Amount*\n₹${amount.toFixed(2)}`
        },
        {
          type: 'mrkdwn',
          text: `*Status*\n_${status}_`
        }
      ]
    }
  ]
};

/**
 * Send notification to Slack channel
 */
export const notifySlack = async (
  channel: string,
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error' = 'info'
) => {
  const colors = {
    info: '#36a64f',
    warning: '#ff9800',
    error: '#f44336'
  };

  return postSlackMessage({
    channel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}*\n${message}`
        }
      }
    ]
  });
};
