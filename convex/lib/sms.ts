'use node';

/**
 * SMS Service - Twilio Integration
 * Handles SMS sending and delivery tracking
 *
 * Install: npm install twilio
 * Environment: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

const twilio = require('twilio');

let client: any = null;

const initSMS = () => {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return client;
};

export interface SMSPayload {
  to: string;
  message: string;
  tags?: string[];
}

export const sendSMS = async (payload: SMSPayload) => {
  try {
    const client = initSMS();

    const message = await client.messages.create({
      body: payload.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: payload.to
    });

    console.debug(`SMS sent to ${payload.to} - SID: ${message.sid}`);
    return {
      success: true,
      messageId: message.sid
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Message templates for common scenarios
 */
export const smsTemplates = {
  lowStockAlert: (productName: string, stock: number) =>
    `Alert: ${productName} stock is low (${stock} units). Reorder now.`,

  paymentReminder: (invoiceNumber: string, amount: number, dueDate: string) =>
    `Invoice ${invoiceNumber} due on ${dueDate}. Amount: ₹${amount}. Pay now to avoid penalties.`,

  orderConfirmation: (orderId: string, total: number) =>
    `Order ${orderId} confirmed! Total: ₹${total}. Track your order in the app.`,

  otpCode: (code: string, expiresIn: number) =>
    `Your OTP is ${code}. Valid for ${expiresIn} minutes. Never share this code.`,

  integrationAlert: (integrationName: string) =>
    `${integrationName} sync failed. Check your settings immediately.`
};

/**
 * Send OTP with rate limiting
 */
const otpAttempts = new Map<string, { count: number; timestamp: number }>();

export const sendOTP = async (
  phoneNumber: string
): Promise<{ success: boolean; code?: string; error?: string }> => {
  const now = Date.now();
  const attempt = otpAttempts.get(phoneNumber);

  // Rate limit: max 3 attempts per 15 minutes
  if (
    attempt &&
    now - attempt.timestamp < 15 * 60 * 1000 &&
    attempt.count >= 3
  ) {
    return {
      success: false,
      error: 'Too many attempts. Try again later.'
    };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await sendSMS({
    to: phoneNumber,
    message: smsTemplates.otpCode(code, 10)
  });

  if (result.success) {
    otpAttempts.set(phoneNumber, {
      count: (attempt?.count || 0) + 1,
      timestamp: now
    });
  }

  return result.success
    ? { success: true, code }
    : { success: false, error: result.error };
};

/**
 * Batch SMS sending
 */
export const sendSMSBatch = async (messages: SMSPayload[]) => {
  const results = await Promise.allSettled(messages.map((msg) => sendSMS(msg)));

  const successful = results.filter(
    (r) => r.status === 'fulfilled' && r.value?.success
  ).length;
  const failed = results.filter(
    (r) => r.status === 'rejected' || !r.value?.success
  ).length;

  return {
    total: messages.length,
    successful,
    failed,
    results
  };
};
