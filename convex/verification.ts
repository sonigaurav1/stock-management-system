// File: convex/verification.js
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { resolveCallerContext, getDataScopeUserId } from './lib/authHelper';

// Generate a 6-digit OTP
function generateRandomOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate and store new OTP
export const generateOtp = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    if (caller.callerId !== args.userId) {
      throw new Error('Can only generate OTP for yourself');
    }

    const userId = caller.callerId;

    // Generate a random 6-digit OTP
    const otp = generateRandomOtp();

    // Set expiration time (1 month)
    const expiresAt = Date.now() + 43200 * 60 * 1000;

    // Store OTP in the database
    // First, delete any existing OTPs for this user
    const existingOtps = await ctx.db
      .query('otpVerification')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    for (const existingOtp of existingOtps) {
      await ctx.db.delete(existingOtp._id);
    }

    // Insert new OTP
    await ctx.db.insert('otpVerification', {
      userId,
      otp: parseInt(otp, 10),
      expiresAt,
      createdAt: Date.now()
    });

    // We are not implementing otp verification feature
    // In a real-world application, you would send this OTP to the user's email
    // using an external service or an action function
    // eslint-disable-next-line no-console
    // console.debug(`OTP for user ${userId}: ${otp}`);

    // Here you would implement email sending logic
    // For example, using a third-party email service through an action

    // This is a placeholder for the email sending logic
    // await ctx.runAction("email/sendOtpEmail", {
    //   to: userEmail,
    //   otp: otp
    // });

    return { success: true };
  }
});

// Verify OTP
export const verifyOtp = mutation({
  args: { userId: v.string(), otp: v.string() },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper authentication
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    // Users can only verify OTP for themselves
    if (caller.callerId !== args.userId) {
      throw new Error('Can only verify OTP for yourself');
    }

    const { otp } = args;

    // Get the stored OTP
    const storedOtp = await ctx.db
      .query('otpVerification')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!storedOtp) {
      return { success: false, message: 'No OTP found' };
    }

    // Check if OTP is expired
    if (storedOtp.expiresAt < Date.now()) {
      return { success: false, message: 'OTP expired' };
    }

    // Check if OTP matches
    if (storedOtp.otp !== parseInt(otp, 10)) {
      return { success: false, message: 'Invalid OTP' };
    }

    // OTP is valid, delete it to prevent reuse
    await ctx.db.delete(storedOtp._id);

    // Update company verification status
    const companyDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (companyDetails) {
      await ctx.db.patch(companyDetails._id, {
        isVerified: true,
        updatedAt: Date.now()
      });
    }

    return { success: true, message: 'Verification successful' };
  }
});

// Get OTP by User ID
export const getOtpByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    if (caller.callerId !== args.userId) {
      throw new Error('Can only view your own OTP');
    }

    const userId = caller.callerId;

    // Fetch OTP details by User ID
    const otpDetails = await ctx.db
      .query('otpVerification')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!otpDetails) {
      return { success: false, message: 'OTP not found' };
    }

    return { success: true, otpDetails };
  }
});
