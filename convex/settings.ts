import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Organization Settings API
 * Handles CRUD operations for organization configuration
 */

export const getOrganizationSettings = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const settings = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return settings || null;
  }
});

export const updateOrganizationSettings = mutation({
  args: {
    companyName: v.string(),
    businessType: v.string(),
    taxNumber: v.string(),
    businessRegistration: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const existing = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const now = Date.now();
    const data = {
      ...args,
      userId,
      updatedAt: now
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert('organizationSettings', {
        ...data,
        createdAt: now
      });
    }
  }
});

/**
 * User Settings API
 * Handles CRUD operations for user preferences
 */

export const getUserSettings = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    // User settings should be tied to the ACTUAL user (callerId), not the organization owner
    const userId = caller.callerId;

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return settings || null;
  }
});

export const upsertUserSettings = mutation({
  args: {
    language: v.optional(v.string()),
    currencyCode: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    timezone: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    lowStockAlerts: v.optional(v.boolean()),
    theme: v.optional(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    // User settings should be tied to the ACTUAL user (callerId), not the organization owner
    const userId = caller.callerId;
    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const now = Date.now();
    const data = {
      userId,
      ...args,
      updatedAt: now
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert('userSettings', {
        ...data,
        createdAt: now
      });
    }
  }
});

// STEP 2.1: Cost Code Mapping CRUD

/**
 * Get cost code mapping for current user
 */
export const getCostCodeMapping = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const settings = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return {
      costCodeMapping: settings?.costCodeMapping || [],
      costCodeEnabled: settings?.costCodeEnabled || false
    };
  }
});

/**
 * Update cost code mapping
 * @param mapping - Array of {digit, codes} entries
 * @param enabled - Whether cost code decoding is active
 */
export const updateCostCodeMapping = mutation({
  args: {
    costCodeMapping: v.array(
      v.object({
        digit: v.string(),
        codes: v.array(v.string())
      })
    ),
    costCodeEnabled: v.boolean()
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const existing = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        costCodeMapping: args.costCodeMapping,
        costCodeEnabled: args.costCodeEnabled,
        updatedAt: Date.now()
      });
    }

    return true;
  }
});

/**
 * Decode a cost code string to numeric value
 * Example: "HIAAB" -> 1120 (H=1, I=1, A=0, A=0, B=based on 0)
 */
export const decodeCostCode = query({
  args: {
    encodedCost: v.string()
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const settings = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!settings?.costCodeEnabled || !settings?.costCodeMapping) {
      // Not enabled or no mapping — try parsing as number
      const parsed = parseFloat(args.encodedCost);
      return isNaN(parsed) ? 0 : parsed;
    }

    const mapping = settings.costCodeMapping;

    // Build lookup: code -> digit value
    const codeToDigit: Record<string, string> = {};
    mapping.forEach((entry) => {
      entry.codes.forEach((code) => {
        codeToDigit[code.toUpperCase()] = entry.digit;
      });
    });

    // Find all unique codes in order
    const digitChars: string[] = [];
    let remaining = args.encodedCost.toUpperCase();

    while (remaining.length > 0) {
      // Try longest match first
      let matched = false;
      for (let len = remaining.length; len >= 1; len--) {
        const substr = remaining.substring(0, len);
        if (codeToDigit[substr] !== undefined) {
          digitChars.push(codeToDigit[substr]);
          remaining = remaining.substring(len);
          matched = true;
          break;
        }
      }
      if (!matched) {
        // No match found — skip this char
        remaining = remaining.substring(1);
      }
    }

    if (digitChars.length === 0) {
      const parsed = parseFloat(args.encodedCost);
      return isNaN(parsed) ? 0 : parsed;
    }

    return parseFloat(digitChars.join('')) || 0;
  }
});
