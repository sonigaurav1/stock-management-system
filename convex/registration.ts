import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * ATOMIC OWNER REGISTRATION
 *
 * Combines all owner registration steps into a single transaction:
 * 1. Create account status
 * 2. Create/update user profile
 * 3. Create company
 * 4. Create user settings
 *
 * This ensures data consistency - either all steps succeed or all fail.
 * Prevents partial registration states that could leave users stuck.
 */
export const completeOwnerRegistration = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    businessType: v.string(),
    companyName: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.string(),
    country: v.string(),
    phone: v.string(),
    taxNumber: v.optional(v.string()),
    website: v.optional(v.string()),
    currencyCode: v.string(),
    dateFormat: v.optional(v.string()),
    theme: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    if (identity.subject !== args.userId) {
      throw new Error('Can only complete registration for yourself');
    }

    const now = Date.now();
    const results = {
      accountStatusId: null as string | null,
      userProfileId: null as string | null,
      companyId: null as string | null,
      userSettingsId: null as string | null
    };

    // STEP 1: Create account status (idempotent - returns existing if present)
    const existingAccountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existingAccountStatus) {
      results.accountStatusId = existingAccountStatus._id.toString();
    } else {
      results.accountStatusId = await ctx.db.insert('accountStatus', {
        userId: args.userId,
        businessType: args.businessType,
        status: 'approved',
        approvedBy: 'system:auto-signup',
        approvedAt: now,
        createdAt: now,
        updatedAt: now
      });
    }

    // STEP 2: Create/update user profile
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        updatedAt: now
      });
      results.userProfileId = existingUser._id.toString();
    } else {
      results.userProfileId = await ctx.db.insert('users', {
        userId: args.userId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        createdAt: now,
        updatedAt: now
      });
    }

    // STEP 3: Create company (idempotent - updates existing if present)
    const existingCompany = await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', args.userId).eq('isDeleted', false)
      )
      .first();

    const companyData = {
      userId: args.userId,
      name: args.companyName,
      address: args.address,
      city: args.city,
      state: args.state,
      postalCode: args.postalCode,
      country: args.country,
      phone: [args.phone],
      email: args.email,
      taxNumber: args.taxNumber || '',
      website: args.website || '',
      businessType: args.businessType,
      type: 'company',
      urls: args.website ? [{ id: 1, value: args.website }] : [],
      isVerified: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    if (existingCompany) {
      await ctx.db.patch(existingCompany._id, companyData);
      results.companyId = existingCompany._id.toString();
    } else {
      results.companyId = await ctx.db.insert('companies', companyData);
    }

    // STEP 4: Create/update user settings
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const settingsData = {
      userId: args.userId,
      language: 'en',
      currencyCode: args.currencyCode,
      dateFormat: args.dateFormat || 'DD/MM/YYYY',
      theme: args.theme || 'light',
      emailNotifications: true,
      lowStockAlerts: true,
      updatedAt: now
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settingsData);
      results.userSettingsId = existingSettings._id.toString();
    } else {
      results.userSettingsId = await ctx.db.insert('userSettings', {
        ...settingsData,
        createdAt: now
      });
    }

    // Log successful registration
    await ctx.db.insert('auditLog', {
      userId: args.userId,
      action: 'owner_registration_completed',
      entityType: 'user',
      entityId: args.userId,
      changes: {
        companyId: results.companyId,
        accountStatusId: results.accountStatusId,
        businessType: args.businessType,
        companyName: args.companyName
      },
      createdAt: now
    });

    return {
      success: true,
      ...results,
      message: 'Owner registration completed successfully'
    };
  }
});

/**
 * ATOMIC STAFF REGISTRATION (Invited Users)
 *
 * Combines all staff registration steps into a single transaction:
 * 1. Create account status
 * 2. Create/update user profile
 * 3. Accept company invitation
 * 4. Create user settings
 */
export const completeStaffRegistration = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    invitationEmail: v.string(), // The email the invitation was sent to
    businessType: v.optional(v.string()),
    currencyCode: v.string()
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    if (identity.subject !== args.userId) {
      throw new Error('Can only complete registration for yourself');
    }

    // Validate invitation email matches authenticated email
    const identityEmail =
      (identity as any).email || (identity as any).claims?.email;
    if (
      identityEmail &&
      identityEmail.toLowerCase() !== args.invitationEmail.toLowerCase()
    ) {
      throw new Error(
        'Invitation email does not match your authenticated email'
      );
    }

    const now = Date.now();
    const results = {
      accountStatusId: null as string | null,
      userProfileId: null as string | null,
      invitationAccepted: false,
      userSettingsId: null as string | null,
      ownerId: null as string | null,
      role: null as string | null
    };

    // STEP 1: Create account status
    const existingAccountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existingAccountStatus) {
      results.accountStatusId = existingAccountStatus._id.toString();
    } else {
      results.accountStatusId = await ctx.db.insert('accountStatus', {
        userId: args.userId,
        businessType: args.businessType || 'retailer',
        status: 'approved',
        approvedBy: 'system:auto-signup',
        approvedAt: now,
        createdAt: now,
        updatedAt: now
      });
    }

    // STEP 2: Create/update user profile
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        updatedAt: now
      });
      results.userProfileId = existingUser._id.toString();
    } else {
      results.userProfileId = await ctx.db.insert('users', {
        userId: args.userId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        createdAt: now,
        updatedAt: now
      });
    }

    // STEP 3: Accept invitation
    const invitation = await ctx.db
      .query('companyMembers')
      .withIndex('by_email', (q) => q.eq('email', args.invitationEmail))
      .filter((q) => q.eq(q.field('status'), 'invited'))
      .first();

    if (!invitation) {
      throw new Error('No pending invitation found for this email');
    }

    await ctx.db.patch(invitation._id, {
      userId: args.userId,
      status: 'accepted',
      acceptedAt: now,
      updatedAt: now
    });

    results.invitationAccepted = true;
    results.ownerId = invitation.companyOwnerId;
    results.role = invitation.role;

    // Log invitation acceptance
    await ctx.db.insert('auditLog', {
      userId: invitation.companyOwnerId,
      action: 'invitation_accepted',
      entityType: 'companyMember',
      entityId: invitation._id.toString(),
      changes: {
        acceptedBy: args.userId,
        acceptedEmail: args.invitationEmail,
        role: invitation.role
      },
      createdAt: now
    });

    // STEP 4: Create user settings
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const settingsData = {
      userId: args.userId,
      language: 'en',
      currencyCode: args.currencyCode,
      dateFormat: 'DD/MM/YYYY',
      theme: 'light',
      emailNotifications: true,
      lowStockAlerts: true,
      updatedAt: now
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settingsData);
      results.userSettingsId = existingSettings._id.toString();
    } else {
      results.userSettingsId = await ctx.db.insert('userSettings', {
        ...settingsData,
        createdAt: now
      });
    }

    // Log successful registration
    await ctx.db.insert('auditLog', {
      userId: invitation.companyOwnerId,
      action: 'staff_registration_completed',
      entityType: 'user',
      entityId: args.userId,
      changes: {
        accountStatusId: results.accountStatusId,
        role: results.role,
        invitedBy: invitation.companyOwnerId
      },
      createdAt: now
    });

    return {
      success: true,
      ...results,
      message: `Welcome! You are now registered as ${results.role}`
    };
  }
});
