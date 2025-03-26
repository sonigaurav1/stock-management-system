import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createProfile = mutation({
  args: {
    companyName: v.string(),
    companyAddress: v.string(),
    phone: v.array(v.string()),
    email: v.string(),
    vatNumber: v.string()
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    try {
      return await ctx.db.insert('companyDetails', {
        userId,
        companyName: args.companyName,
        companyAddress: args.companyAddress,
        phone: args.phone,
        email: args.email,
        vatNumber: args.vatNumber,
        isDeleted: false,
        isVerified: false,
        urls: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      throw new Error('Failed to create profile');
    }
  }
});

export const updateProfile = mutation({
  args: {
    id: v.id('companyDetails'),
    updates: v.object({
      companyName: v.optional(v.string()),
      companyAddress: v.optional(v.string()),
      phone: v.optional(v.array(v.string())),
      email: v.optional(v.string()),
      vatNumber: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingProfile = await ctx.db.get(args.id);
    if (!existingProfile || existingProfile.userId !== userId) {
      throw new Error('Unauthorized');
    }

    let updates = { ...args.updates };
    try {
      return await ctx.db.patch(args.id, {
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }
});

export const deleteProfile = mutation({
  args: {
    id: v.id('companyDetails')
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingProfile = await ctx.db.get(args.id);
    if (!existingProfile || existingProfile.userId !== userId) {
      throw new Error('Unauthorized');
    }

    try {
      return await ctx.db.patch(args.id, {
        isDeleted: true,
        updatedAt: Date.now()
      });
    } catch (error) {
      throw new Error('Failed to delete profile');
    }
  }
});

export const getProfileById = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    if (args.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const profiles = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    if (profiles.length === 0) {
      // throw new Error('Profile not found');
      return null;
    }

    return profiles[0];
  }
});
