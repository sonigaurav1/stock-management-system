// File: convex/companyDetails.js
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Get company details for a specific user
export const getCompanyDetails = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    const companyDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    return companyDetails;
  }
});

export const createCompanyDetails = mutation({
  args: {
    companyName: v.string(),
    companyAddress: v.string(),
    phone: v.array(v.string()),
    email: v.string(),
    vatNumber: v.string(),
    urls: v.array(v.object({ id: v.number(), value: v.string() })),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    processedBy: v.optional(v.string()) // Added field to track the user who create the invoice receipt
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    // Check if company details already exist for this user
    const existingDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (existingDetails) {
      // Update existing details
      return await ctx.db.patch(existingDetails._id, {
        companyName: args.companyName,
        companyAddress: args.companyAddress,
        phone: args.phone,
        email: args.email,
        vatNumber: args.vatNumber,
        urls: args.urls,
        processedBy: args.processedBy, // Set the user who created the company details
        updatedAt: Date.now()
      });
    } else {
      // Create new company details
      const newDetails = await ctx.db.insert('companyDetails', {
        userId,
        companyName: args.companyName,
        companyAddress: args.companyAddress,
        phone: args.phone,
        email: args.email,
        vatNumber: args.vatNumber,
        urls: args.urls,
        isVerified: false,
        isDeleted: args.isDeleted,
        createdAt: args.createdAt,
        processedBy: args.processedBy // Set the user who created the company details
      });

      return newDetails;
    }
  }
});

// Update company details
export const updateCompanyDetails = mutation({
  args: {
    companyName: v.string(),
    companyAddress: v.string(),
    phone: v.array(v.string()),
    email: v.string(),
    vatNumber: v.string(),
    urls: v.array(v.object({ id: v.number(), value: v.string() }))
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const companyDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (!companyDetails) {
      throw new Error('Company details not found');
    }

    return await ctx.db.patch(companyDetails._id, {
      ...args,
      updatedAt: Date.now()
    });
  }
});

// Update verification status
export const updateVerificationStatus = mutation({
  args: { userId: v.string(), isVerified: v.boolean() },
  handler: async (ctx, args) => {
    const { userId, isVerified } = args;

    const companyDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (!companyDetails) {
      throw new Error('Company details not found');
    }

    return await ctx.db.patch(companyDetails._id, {
      isVerified,
      updatedAt: Date.now()
    });
  }
});

// Create company details from registration form (simplified version)
export const createCompanyDetailsFromRegistration = mutation({
  args: {
    userId: v.string(),
    companyName: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    country: v.string(),
    phone: v.string(), // Single phone string from form
    email: v.string(),
    taxNumber: v.optional(v.string()),
    website: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    if (identity.subject !== args.userId) {
      throw new Error('Can only update your own company details');
    }

    // Check if company details already exist for this user
    const existingDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', args.userId).eq('isDeleted', false)
      )
      .first();

    const fullAddress = `${args.address}, ${args.city}, ${args.state} ${args.postalCode}, ${args.country}`;
    const phoneArray = [args.phone];
    const websiteUrl = args.website ? [{ id: 1, value: args.website }] : [];

    if (existingDetails) {
      // Update existing details
      return await ctx.db.patch(existingDetails._id, {
        companyName: args.companyName,
        companyAddress: fullAddress,
        phone: phoneArray,
        email: args.email,
        vatNumber: args.taxNumber || '',
        urls: websiteUrl,
        updatedAt: Date.now()
      });
    } else {
      // Create new company details
      return await ctx.db.insert('companyDetails', {
        userId: args.userId,
        companyName: args.companyName,
        companyAddress: fullAddress,
        phone: phoneArray,
        email: args.email,
        vatNumber: args.taxNumber || '',
        urls: websiteUrl,
        isVerified: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }
});

// Get company name by ID
export const getCompanyNameById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    const companyDetails = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (!companyDetails) {
      return null;
    }

    return companyDetails.companyName;
  }
});

// Check if business profile is complete
export const isBusinessProfileComplete = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Check organizationSettings table instead of companyDetails
    const organizationSettings = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!organizationSettings) {
      return false;
    }

    // Check if all required fields are present
    const isComplete =
      organizationSettings.companyName &&
      organizationSettings.businessType &&
      organizationSettings.address &&
      organizationSettings.city &&
      organizationSettings.state &&
      organizationSettings.country &&
      organizationSettings.phone &&
      organizationSettings.email;

    return isComplete;
  }
});
