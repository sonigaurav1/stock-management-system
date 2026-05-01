'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';

/**
 * Send invitation email via SendGrid
 * This is an action (not mutation) because it requires Node.js for SendGrid
 */
export const sendInviteEmail = action({
  args: {
    to: v.string(),
    displayName: v.string(),
    inviteLink: v.string(),
    ownerName: v.string(),
    companyName: v.string(),
    role: v.string()
  },
  handler: async (ctx, args) => {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

    try {
      const msg = {
        to: args.to,
        from: process.env.EMAIL_FROM || 'noreply@inventorysystem.com',
        subject: `You're invited to join ${args.companyName} on Digital Dukan`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              
              <h1 style="color: #333; margin-bottom: 10px;">You've been invited! 🎉</h1>
              <p style="color: #666; font-size: 14px; margin-top: 0;">
                <strong>${args.ownerName}</strong> has invited you to join <strong>${args.companyName}</strong> on Digital Dukan
              </p>

              <div style="background-color: #f9f9f9; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #333;"><strong>Your Role:</strong> ${args.role}</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">You'll have access to inventory, sales, and reporting features based on this role.</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${args.inviteLink}" style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                  Accept Invitation
                </a>
              </div>

              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                If the button above doesn't work, copy and paste this link in your browser:<br>
                <code style="background-color: #f5f5f5; padding: 5px; border-radius: 3px; word-break: break-all;">${args.inviteLink}</code>
              </p>

              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                This invitation expires in 7 days. If you have questions, contact your administrator.
              </p>
            </div>
          </div>
        `
      };

      const response = await sgMail.send(msg);
      console.log(`Invitation email sent to ${args.to}`);

      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id'] || 'sent'
      };
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw error;
    }
  }
});
