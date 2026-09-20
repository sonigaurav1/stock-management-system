import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createUserSubscription = mutation({
  args: {
    planType: v.string(),
    status: v.string(),
    startDate: v.number(),
    autoRenew: v.boolean()
  },
  handler: async (ctx, args) => {
    // Implementation will go here
    const callerId = (await ctx.auth.getUserIdentity())?.subject;

    if (!callerId) {
      throw new Error('Not authenticated');
    }

    // TODO: Implement subscription creation logic
    // This should:
    // 1. Create a subscription record in the database
    // 2. Set up payment processing (if paid plan)
    // 3. Update user's subscription status
    // 4. Handle trial periods if applicable

    // For now, just creating for free plan
    await ctx.db.insert('userSubscriptions', {
      userId: callerId,
      planType: args.planType as 'free' | 'premium',
      status: args.status as 'active' | 'trial' | 'expired' | 'cancelled',
      startDate: args.startDate,
      autoRenew: args.autoRenew,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return { success: true };
  }
});

export const getUserSubscription = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
    return subscription;
  }
});

export const updateUserSubscription = mutation({
  args: {
    subscriptionId: v.string(),
    planType: v.optional(v.string()),
    status: v.optional(v.string()),
    endDate: v.optional(v.number()),
    autoRenew: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const callerId = (await ctx.auth.getUserIdentity())?.subject;

    if (!callerId) {
      throw new Error('Not authenticated');
    }

    // TODO: Implement subscription update logic
    // This should:
    // 1. Update the subscription record in the database
    // 2. Handle plan changes
    // 3. Update payment information if needed
    // 4. Update user's subscription status

    await ctx.db.patch(args.subscriptionId as Id<'userSubscriptions'>, {
      planType: args.planType as 'free' | 'premium',
      status: args.status as 'active' | 'trial' | 'expired' | 'cancelled',
      endDate: args.endDate,
      autoRenew: args.autoRenew,
      updatedAt: Date.now()
    });

    return { success: true };
  }
});
