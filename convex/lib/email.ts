'use node';

/**
 * Email Service - SendGrid Integration
 * Handles email templating, sending, and delivery tracking
 *
 * Install: npm install @sendgrid/mail
 * Environment: SENDGRID_API_KEY
 */

const sgMail = require('@sendgrid/mail');

const initEmail = () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
};

export const emailTemplates = {
  LOW_STOCK: 'low-stock-alert',
  INVOICE_CREATED: 'invoice-created',
  PAYMENT_RECEIVED: 'payment-received',
  ORDER_CONFIRMED: 'order-confirmed',
  INTEGRATION_FAILED: 'integration-failed'
};

export interface EmailPayload {
  to: string;
  templateId: string;
  templateData: Record<string, any>;
}

export const sendEmail = async (payload: EmailPayload) => {
  try {
    initEmail();

    const msg = {
      to: payload.to,
      from: process.env.EMAIL_FROM || 'noreply@inventorysystem.com',
      templateId: payload.templateId,
      dynamicTemplateData: payload.templateData
    };

    const response = await sgMail.send(msg);

    console.log(`Email sent to ${payload.to}`);
    return {
      success: true,
      messageId: response[0].headers['x-message-id']
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Email templates for different scenarios
 */
export const emailTemplateData = {
  lowStockAlert: (
    productName: string,
    stock: number,
    reorderLevel: number
  ) => ({
    productName,
    currentStock: stock,
    reorderLevel,
    actionUrl: `${process.env.APP_URL}/products`
  }),

  invoiceCreated: (invoiceNumber: string, amount: number, dueDate: string) => ({
    invoiceNumber,
    amount: `₹${amount.toFixed(2)}`,
    dueDate,
    actionUrl: `${process.env.APP_URL}/invoices/${invoiceNumber}`
  }),

  paymentReceived: (invoiceNumber: string, amount: number) => ({
    invoiceNumber,
    amount: `₹${amount.toFixed(2)}`,
    actionUrl: `${process.env.APP_URL}/invoices/${invoiceNumber}`
  }),

  orderConfirmed: (orderId: string, items: number, total: number) => ({
    orderId,
    itemCount: items,
    total: `₹${total.toFixed(2)}`,
    actionUrl: `${process.env.APP_URL}/orders/${orderId}`
  }),

  integrationFailed: (integrationName: string, error: string) => ({
    integrationName,
    error,
    actionUrl: `${process.env.APP_URL}/settings/integrations`
  })
};

/**
 * Batch email sending with error handling
 */
export const sendEmailBatch = async (emails: EmailPayload[]) => {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const successful = results.filter(
    (r) => r.status === 'fulfilled' && r.value?.success
  ).length;
  const failed = results.filter(
    (r) => r.status === 'rejected' || !r.value?.success
  ).length;

  return {
    total: emails.length,
    successful,
    failed,
    results
  };
};
