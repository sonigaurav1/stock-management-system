'use node';

/**
 * Webhook Management Service
 * Executes webhooks with retry logic, signature validation, and delivery tracking
 *
 * Features:
 * - Request signing with HMAC-SHA256
 * - Exponential backoff retry logic
 * - Delivery attempt tracking
 * - Event payload serialization
 */

import crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface WebhookExecutionResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
  retryCount: number;
  nextRetryAt?: number;
}

/**
 * Generate HMAC-SHA256 signature for webhook request
 */
export const generateWebhookSignature = (
  payload: string,
  secret: string
): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

/**
 * Verify incoming webhook signature
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Execute webhook with exponential backoff retry
 */
export const executeWebhook = async (
  url: string,
  payload: WebhookPayload,
  secret: string,
  maxRetries: number = 5
): Promise<WebhookExecutionResult> => {
  const payloadString = JSON.stringify(payload);
  const signature = generateWebhookSignature(payloadString, secret);

  let lastError: Error | null = null;
  let lastStatusCode: number | null = null;
  let lastResponse: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Timestamp': payload.timestamp.toString()
        },
        body: payloadString
      });

      lastStatusCode = response.status;
      lastResponse = await response.text();

      // Success if 2xx status code
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          statusCode: response.status,
          response: lastResponse,
          retryCount: attempt
        };
      }

      // Retry on 5xx errors or 429 (rate limit)
      if (
        (response.status >= 500 && response.status < 600) ||
        response.status === 429
      ) {
        if (attempt < maxRetries) {
          // Exponential backoff: 1, 2, 4, 8, 16 seconds
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // Don't retry on 4xx client errors (except 429)
      return {
        success: false,
        statusCode: response.status,
        response: lastResponse,
        error: `HTTP ${response.status}: ${lastResponse?.substring(0, 200)}`,
        retryCount: attempt
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  return {
    success: false,
    statusCode: lastStatusCode || undefined,
    error: lastError?.message || 'Max retries exceeded',
    retryCount: maxRetries,
    nextRetryAt: Date.now() + 5 * 60 * 1000 // Retry in 5 minutes
  };
};

/**
 * Batch webhook execution for events
 */
export const triggerWebhooks = async (
  webhooks: Array<{ id: string; url: string; secret: string }>,
  event: string,
  data: Record<string, any>
) => {
  const payload: WebhookPayload = {
    event,
    timestamp: Date.now(),
    data
  };

  const results = await Promise.allSettled(
    webhooks.map((webhook) =>
      executeWebhook(webhook.url, payload, webhook.secret)
    )
  );

  const successful = results.filter(
    (r) => r.status === 'fulfilled' && r.value?.success
  ).length;
  const failed = results.filter(
    (r) => r.status === 'rejected' || !r.value?.success
  ).length;

  return {
    event,
    totalWebhooks: webhooks.length,
    successful,
    failed,
    results: results.map((r, i) => ({
      webhookId: webhooks[i].id,
      result:
        r.status === 'fulfilled'
          ? r.value
          : { success: false, error: String(r.reason) }
    }))
  };
};

/**
 * Webhook event definitions
 */
export const webhookEvents = {
  // Product events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',

  // Stock events
  STOCK_UPDATED: 'stock.updated',
  STOCK_LOW: 'stock.low',
  STOCK_REORDERED: 'stock.reordered',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_SHIPPED: 'order.shipped',

  // Invoice events
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',

  // Payment events
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_PROCESSED: 'refund.processed'
};
