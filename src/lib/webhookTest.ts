'use node';

/**
 * Webhook Testing Utility
 * Test webhook endpoints and verify payload delivery
 */

import crypto from 'crypto';

const generateWebhookSignature = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

export interface WebhookTestPayload {
  event: string;
  timestamp: number;
  data: {
    testMode: true;
    message: string;
  };
}

/**
 * Test webhook endpoint with sample payload
 */
export const testWebhook = async (
  webhookUrl: string,
  secret: string,
  eventType: string = 'test.event'
): Promise<{
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
  deliveryTime?: number;
}> => {
  const testPayload: WebhookTestPayload = {
    event: eventType,
    timestamp: Date.now(),
    data: {
      testMode: true,
      message: 'This is a test webhook delivery'
    }
  };

  const payloadString = JSON.stringify(testPayload);
  const signature = generateWebhookSignature(payloadString, secret);

  const startTime = Date.now();

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': testPayload.timestamp.toString(),
        'X-Webhook-Test': 'true'
      },
      body: payloadString
    });

    const deliveryTime = Date.now() - startTime;
    const responseText = await response.text();

    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        response: responseText,
        deliveryTime
      };
    }

    return {
      success: false,
      statusCode: response.status,
      response: responseText,
      deliveryTime
    };
  } catch (error) {
    const deliveryTime = Date.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      deliveryTime
    };
  }
};

/**
 * Get webhook test examples for common events
 */
export const getWebhookExamples = (eventType: string) => {
  const examples: Record<string, any> = {
    'product.created': {
      event: 'product.created',
      timestamp: Date.now(),
      data: {
        productId: 'prod_123abc',
        name: 'Product Name',
        sku: 'SKU-001',
        price: 999.99,
        stock: 50
      }
    },
    'order.created': {
      event: 'order.created',
      timestamp: Date.now(),
      data: {
        orderId: 'ord_456def',
        customerId: 'cust_789ghi',
        total: 5999.99,
        items: [{ productId: 'prod_123abc', quantity: 2, price: 999.99 }],
        status: 'pending'
      }
    },
    'payment.received': {
      event: 'payment.received',
      timestamp: Date.now(),
      data: {
        paymentId: 'pay_xyz789',
        orderId: 'ord_456def',
        amount: 5999.99,
        method: 'razorpay',
        status: 'captured'
      }
    },
    'stock.low': {
      event: 'stock.low',
      timestamp: Date.now(),
      data: {
        productId: 'prod_123abc',
        name: 'Product Name',
        currentStock: 5,
        reorderLevel: 20
      }
    },
    'invoice.created': {
      event: 'invoice.created',
      timestamp: Date.now(),
      data: {
        invoiceId: 'inv_101112',
        orderId: 'ord_456def',
        total: 5999.99,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  };

  return examples[eventType] || examples['product.created'];
};

/**
 * Validate webhook URL format
 */
export const isValidWebhookUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return /^https?:$/.test(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Get webhook delivery history template
 */
export const getDeliveryHistory = (webhookId: string) => {
  return {
    webhookId,
    deliveries: [
      {
        attemptId: 'att_1',
        event: 'product.created',
        timestamp: Date.now() - 3600000,
        statusCode: 200,
        deliveryTime: 145,
        success: true
      },
      {
        attemptId: 'att_2',
        event: 'order.created',
        timestamp: Date.now() - 1800000,
        statusCode: 500,
        deliveryTime: 5000,
        success: false,
        error: 'Internal Server Error'
      }
    ],
    summary: {
      total: 2,
      successful: 1,
      failed: 1,
      averageDeliveryTime: 2572
    }
  };
};
