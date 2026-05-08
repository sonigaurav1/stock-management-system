/**
 * convex/companies.ts
 *
 * Unified companies module consolidating:
 * - firms (from convex/ledger.ts)
 * - companyDetails
 * - organizationSettings
 *
 * Phase 2A Refactoring: Single source of truth for company/org/firm metadata
 */

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Get company by user (single company per user model)
 *
 * Returns active company for authenticated user.
 * For team members, returns the owner's company if they don't have their own.
 */
export const getCompany = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // First, check if user has their own company
    const company = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (company) {
      return company;
    }

    // User doesn't have their own company - check if they're a team member
    const teamMembership = await ctx.db
      .query('teamMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (teamMembership) {
      // Get the owner's company through the team
      const ownerCompany = await ctx.db
        .query('companies')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', teamMembership.userId).eq('isDeleted', false)
        )
        .first();

      if (ownerCompany) {
        return ownerCompany;
      }
    }

    return null;
  }
});

/**
 * Get company by ID (lookup by Convex document ID)
 */
export const getCompanyById = query({
  args: { companyId: v.id('companies') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  }
});

/**
 * Resolve the effective userId for queries
 * If user is a team member without their own company, returns owner's userId
 */
export const resolveEffectiveUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // First check if user has their own company
    const company = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', args.userId).eq('isDeleted', false)
      )
      .first();

    if (company) {
      return args.userId;
    }

    // User doesn't have their own company - check if they're a team member
    const teamMembership = await ctx.db
      .query('teamMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (teamMembership) {
      // Return the owner's userId
      return teamMembership.userId;
    }

    // No company and not a team member - return original userId
    return args.userId;
  }
});

/**
 * Get company name for display
 *
 * For staff accounts (companyMembers), returns the owner's company name.
 * For direct company owners, returns their own company name.
 */
export const getCompanyName = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // First, check if user has their own company
    const company = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (company) {
      return company?.name ?? null;
    }

    // User doesn't have their own company - check if they're a staff member (companyMembers)
    // Use filter since companyMembers has index by_company_and_userId (companyOwnerId, userId)
    const membership = await ctx.db
      .query('companyMembers')
      .filter((q) => q.eq(q.field('userId'), userId))
      .first();

    if (membership && membership.status === 'accepted') {
      // Get the owner's company
      const ownerCompany = await ctx.db
        .query('companies')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', membership.companyOwnerId).eq('isDeleted', false)
        )
        .first();

      if (ownerCompany) {
        return ownerCompany.name;
      }
    }

    return null;
  }
});

/**
 * List all companies for a user (includes deleted)
 * Useful for recovery/audit
 */
export const listAllCompanies = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('companies')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  }
});

/**
 * List companies by type (e.g., "firm" vs "company")
 * Useful during migration when both types exist
 */
export const listCompaniesByType = query({
  args: { userId: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('companies')
      .withIndex('by_user_and_type', (q) =>
        q.eq('userId', args.userId).eq('type', args.type)
      )
      .collect();
  }
});

/**
 * Create a new company
 *
 * Consolidated endpoint replacing:
 * - createCompanyDetails
 * - createFirm
 * - createOrganizationSettings
 */
export const createCompany = mutation({
  args: {
    name: v.string(),
    businessType: v.string(),
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.array(v.string()),
    email: v.string(),
    website: v.optional(v.string()),
    taxNumber: v.string(),
    businessRegistration: v.optional(v.string()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    urls: v.optional(v.array(v.object({ id: v.number(), value: v.string() }))),
    owner: v.optional(v.string()),
    type: v.string(), // "company" | "firm"
    processedBy: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    // Check if company already exists
    const existing = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (existing) {
      // Update existing
      return await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now()
      });
    }

    const { urls, ...restArgs } = args;

    // Create new
    return await ctx.db.insert('companies', {
      userId,
      isVerified: false,
      isDeleted: false,
      createdAt: Date.now(),
      ...restArgs,
      urls: urls ?? []
    });
  }
});

/**
 * Update company information
 */
export const updateCompany = mutation({
  args: {
    name: v.optional(v.string()),
    businessType: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    taxNumber: v.optional(v.string()),
    businessRegistration: v.optional(v.string()),
    logo: v.optional(v.string()),
    description: v.optional(v.string()),
    urls: v.optional(v.array(v.object({ id: v.number(), value: v.string() }))),
    isVerified: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const company = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (!company) {
      throw new Error('Company not found');
    }

    return await ctx.db.patch(company._id, {
      ...args,
      updatedAt: Date.now()
    });
  }
});

/**
 * Update verification status
 */
export const updateVerificationStatus = mutation({
  args: { userId: v.string(), isVerified: v.boolean() },
  handler: async (ctx, args) => {
    const { userId, isVerified } = args;

    const company = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (!company) {
      throw new Error('Company not found');
    }

    return await ctx.db.patch(company._id, {
      isVerified,
      updatedAt: Date.now()
    });
  }
});

/**
 * Check if business profile is complete
 *
 * Validates that all required fields are populated
 */
export const isBusinessProfileComplete = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    const company = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    if (!company) {
      return false;
    }

    // Check all required fields
    const isComplete =
      company.name &&
      company.businessType &&
      company.address &&
      company.city &&
      company.state &&
      company.country &&
      company.phone?.length > 0 &&
      company.email &&
      company.taxNumber;

    return !!isComplete;
  }
});

/**
 * Soft delete a company
 */
export const deleteCompany = mutation({
  args: { companyId: v.id('companies') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const company = await ctx.db.get(args.companyId);
    if (!company || company.userId !== identity.subject) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.companyId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});

/**
 * Restore a deleted company
 */
export const restoreCompany = mutation({
  args: { companyId: v.id('companies') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const company = await ctx.db.get(args.companyId);
    if (!company || company.userId !== identity.subject) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.companyId, {
      isDeleted: false,
      updatedAt: Date.now()
    });
  }
});

/**
 * Create company from registration (simplified)
 *
 * Used during onboarding to create company in a single call
 */
export const createCompanyFromRegistration = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    businessType: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    country: v.string(),
    phone: v.string(), // Single phone, will be converted to array
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
      throw new Error('Can only update your own company');
    }

    const existing = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', args.userId).eq('isDeleted', false)
      )
      .first();

    const companyData = {
      userId: args.userId,
      name: args.name,
      address: args.address,
      city: args.city,
      state: args.state,
      postalCode: args.postalCode,
      country: args.country,
      phone: [args.phone],
      email: args.email,
      taxNumber: args.taxNumber || '',
      website: args.website || '',
      businessType: args.businessType || 'retailer',
      type: 'company',
      urls: args.website ? [{ id: 1, value: args.website }] : [],
      isVerified: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    let companyId;
    if (existing) {
      companyId = await ctx.db.patch(existing._id, companyData);
    } else {
      companyId = await ctx.db.insert('companies', companyData);

      // NOTE: Owner is NOT added to companyMembers table.
      // Owners are handled specially via resolveCallerContext which returns:
      // - isOwner: true
      // - ownerId: callerId (they access their own data)
      // - role: 'owner'
      // - All permissions granted
      // This is intentional - owners have full access without needing a membership record.
    }

    return companyId;
  }
});
