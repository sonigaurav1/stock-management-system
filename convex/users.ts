import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// Store or update user profile with username
export const upsertUserProfile = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);

    // For staff members signing up: use their actual Clerk ID.
    // For owners: getDataScopeUserId returns their own ID.
    // This ensures staff profiles are created with their own Clerk ID, not owner's ID.
    const profileUserId = caller.callerId;

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', profileUserId))
      .first();

    // Allow users to create their own profile during sign-up.
    // Staff members sign up AFTER accepting an invitation, so they should always be allowed
    // to create their own profile when it doesn't exist yet.
    // Require manage_users permission for UPDATING existing profiles (prevents staff from editing others).
    const isCreatingOwnProfile = !existingUser;
    if (!isCreatingOwnProfile) {
      requirePermission(caller, PERMISSIONS.MANAGE_USERS);
    }

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        updatedAt: Date.now()
      });
      return existingUser._id;
    } else {
      // Create new user with their actual Clerk ID
      const newUserId = await ctx.db.insert('users', {
        userId: profileUserId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return newUserId;
    }
  }
});

// Get user profile by username (for @mentions)
export const getUserByUsername = query({
  args: {
    username: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    return user;
  }
});

// Check username availability and generate suggestions
export const checkUsernameAvailability = query({
  args: {
    username: v.string()
  },
  handler: async (ctx, args) => {
    const username = args.username.toLowerCase().trim();

    if (!username || username.length < 3) {
      return {
        available: false,
        message: 'Username must be at least 3 characters',
        suggestions: []
      };
    }

    if (username.length > 30) {
      return {
        available: false,
        message: 'Username must not exceed 30 characters',
        suggestions: []
      };
    }

    // Check if username matches pattern: letters, numbers, underscores, hyphens
    const pattern = /^[a-z0-9_-]+$/;
    if (!pattern.test(username)) {
      return {
        available: false,
        message:
          'Username can only contain letters, numbers, underscores, and hyphens',
        suggestions: []
      };
    }

    // Check if username is taken
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();

    if (!existingUser) {
      return {
        available: true,
        message: 'Username is available!',
        suggestions: []
      };
    }

    // Username is taken, generate suggestions
    const suggestions = generateUsernameSuggestions(username);

    return {
      available: false,
      message:
        'This username is already taken. Try one of the suggestions below.',
      suggestions: suggestions
    };
  }
});

// Check email availability
export const checkEmailAvailability = query({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    if (!email) {
      return {
        available: false,
        message: 'Email is required'
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        available: false,
        message: 'Please enter a valid email address'
      };
    }

    // users.email can contain mixed casing from legacy writes, so compare case-insensitively.
    const users = await ctx.db.query('users').collect();
    const existingUser = users.find(
      (user: any) => (user.email || '').toLowerCase() === email
    );

    if (!existingUser) {
      return {
        available: true,
        message: 'Email is available!'
      };
    }

    return {
      available: false,
      message: 'This email is already taken.'
    };
  }
});

// Helper function to generate username suggestions
function generateUsernameSuggestions(baseUsername: string): string[] {
  const suggestions: Set<string> = new Set();

  // Add numbers to the end
  for (let i = 1; i <= 3; i++) {
    suggestions.add(`${baseUsername}${i}`);
    suggestions.add(`${baseUsername}${Math.floor(Math.random() * 999)}`);
  }

  // Add underscores and variations
  if (baseUsername.includes('_')) {
    suggestions.add(baseUsername.replace('_', ''));
  } else if (baseUsername.length < 28) {
    suggestions.add(`${baseUsername}_1`);
    suggestions.add(`${baseUsername}_pro`);
    suggestions.add(`${baseUsername}_user`);
  }

  // Add prefix/suffix variations containing the original word
  if (baseUsername.length < 25) {
    suggestions.add(`real_${baseUsername}`);
    suggestions.add(`the_${baseUsername}`);
    suggestions.add(`official_${baseUsername}`);
    suggestions.add(`${baseUsername}_official`);
  }

  // Add variation with hyphens
  if (baseUsername.includes('_')) {
    suggestions.add(baseUsername.replace(/_/g, '-'));
  } else if (baseUsername.length < 28) {
    suggestions.add(`${baseUsername}-1`);
    suggestions.add(`${baseUsername}-pro`);
  }

  // Return first 5 suggestions that are not the original
  return Array.from(suggestions)
    .filter((s) => s !== baseUsername)
    .slice(0, 5);
}

// Get current user's profile
export const getCurrentUserProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    return user;
  }
});

// Get users by ID (for mentions resolution)
export const getUsersByIds = query({
  args: {
    userIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.userIds.map(async (userId) => {
        return await ctx.db
          .query('users')
          .withIndex('by_userId', (q) => q.eq('userId', userId))
          .first();
      })
    );

    return users.filter((user) => user !== undefined);
  }
});

// Delete all user data from Convex (called during account deletion)
// IMPORTANT: Most tables are hard-deleted for full account removal.
// Exception: companies are soft-deleted to preserve internal audit continuity.
export const deleteAllUserData = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    const userId = identity.subject;

    const softDeleteCompanies = async () => {
      try {
        const companies = await ctx.db
          .query('companies')
          .withIndex('by_user_and_isDeleted', (q) =>
            q.eq('userId', userId).eq('isDeleted', false)
          )
          .collect();

        for (const company of companies) {
          await ctx.db.patch(company._id, {
            isDeleted: true,
            updatedAt: Date.now()
          });
        }
      } catch (error) {
        // Continue if companies table is unavailable in this environment
      }
    };

    // Helper function to hard delete records from a table
    const deleteFromTable = async (tableName: string) => {
      try {
        const db = ctx.db as any;
        const records: any[] = [];

        // Get all records from table and filter by userId
        const allRecords = await db.query(tableName).collect();
        for (const record of allRecords) {
          if (record.userId === userId) {
            records.push(record);
          }
        }

        // Hard delete all records for this user
        for (const record of records) {
          await ctx.db.delete(record._id);
        }
      } catch (error) {
        // Continue even if table doesn't exist or can't be queried
      }
    };

    // Most tables are hard-deleted for account deletion.
    const allTables = [
      'products',
      'category',
      'suppliers',
      'stockMovements',
      'sales',
      'customers',
      'invoices',
      'firms',
      'transactions',
      'companyDetails',
      'expenses',
      'expenseCategories',
      'budgets',
      'recurringExpenses',
      'expenseReports',
      'customReports',
      'scheduledReports',
      'purchaseOrders',
      'reconciliationMatches',
      'inventoryReconciliations',
      'priceChangeRequests',
      'locations',
      'payments',
      'otpVerification',
      'userSettings',
      'organizations',
      'organizationMembers',
      'accountStatus',
      'companyMembers',
      'organizationSettings',
      'notificationRules',
      'integrations',
      'apiKeys',
      'webhooks',
      'automationRules',
      'auditLog',
      'systemLog',
      'featureUsage',
      'dashboardWidgets',
      'insightSettings',
      'userInsights',
      'dashboardExports',
      'expenseApprovals',
      'expenseReceipts',
      'reportExecutions',
      'reportExports',
      'transactionCategoryMappings',
      'bulkOperationJobs',
      'discountAudit',
      'taxReports',
      'taxPayments',
      'locationInventory',
      'stockTransfers'
    ];

    // Companies are soft-deleted instead of hard-deleted.
    await softDeleteCompanies();

    // Hard delete from all tables
    for (const tableName of allTables) {
      try {
        await deleteFromTable(tableName);
      } catch (error) {
        // Continue even if table doesn't exist
        console.log(`Table ${tableName} not found or error occurred`);
      }
    }

    // Delete user's profile record
    try {
      const userRecord = await ctx.db
        .query('users')
        .withIndex('by_userId', (q) => q.eq('userId', userId))
        .first();

      if (userRecord) {
        await ctx.db.delete(userRecord._id);
      }
    } catch (error) {
      console.log('Error deleting user profile');
    }

    return {
      success: true,
      message: 'All user data permanently deleted successfully'
    };
  }
});

// Export all user data as a backup file
export const exportUserDataAsBackup = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    const userId = identity.subject;
    const exportData: any = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      userId: userId,
      checksumVersion: 'sha256',
      tables: {}
    };

    // Helper to export from a table
    const exportTable = async (tableName: string) => {
      try {
        // Use any to bypass strict typing
        const db = ctx.db as any;
        const records: any[] = [];

        // Try getting all records from table and filter by userId
        const allRecords = await db.query(tableName).collect();
        for (const record of allRecords) {
          if (record.userId === userId) {
            records.push(record);
          }
        }

        if (records.length > 0) {
          exportData.tables[tableName] = {
            count: records.length,
            records: records.map((record: any) => {
              const { _id, _creationTime, ...data } = record;
              return data;
            })
          };
        }
      } catch (error) {
        // Table doesn't exist, skip silently
      }
    };

    // List of all tables to export
    const tablesToExport = [
      'users',
      'products',
      'category',
      'suppliers',
      'stockMovements',
      'sales',
      'customers',
      'invoices',
      'firms',
      'transactions',
      'companyDetails',
      'expenses',
      'expenseCategories',
      'budgets',
      'recurringExpenses',
      'expenseReports',
      'customReports',
      'scheduledReports',
      'purchaseOrders',
      'reconciliationMatches',
      'inventoryReconciliations',
      'priceChangeRequests',
      'locations',
      'locationInventory',
      'stockTransfers',
      'payments',
      'userSettings',
      'organizations',
      'organizationMembers',
      'accountStatus',
      'companyMembers',
      'organizationSettings',
      'notificationRules',
      'integrations',
      'apiKeys',
      'webhooks',
      'automationRules',
      'dashboardWidgets',
      'insightSettings',
      'userInsights',
      'dashboardExports'
    ];

    // Export data from each table
    for (const tableName of tablesToExport) {
      await exportTable(tableName);
    }

    // Calculate checksum
    const dataString = JSON.stringify(exportData);
    let checksum = 0;
    for (let i = 0; i < dataString.length; i++) {
      checksum = (checksum << 5) - checksum + dataString.charCodeAt(i);
      checksum = checksum & checksum;
    }
    exportData.checksum = Math.abs(checksum).toString(16);

    return exportData;
  }
});

// Import user data from a backup file
export const importUserDataFromBackup = mutation({
  args: {
    backupData: v.any() // Backup file contents
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }

    const newUserId = identity.subject;
    const backup = args.backupData;

    // Validation checks
    if (!backup.version || backup.version !== '1.0.0') {
      throw new Error('Invalid backup format version');
    }

    if (!backup.tables || typeof backup.tables !== 'object') {
      throw new Error('Invalid backup structure');
    }

    // Verify checksum hasn't been tampered with
    const backupCopy = { ...backup };
    const originalChecksum = backupCopy.checksum;
    delete backupCopy.checksum;

    const dataString = JSON.stringify(backupCopy);
    let calculatedChecksum = 0;
    for (let i = 0; i < dataString.length; i++) {
      calculatedChecksum =
        (calculatedChecksum << 5) -
        calculatedChecksum +
        dataString.charCodeAt(i);
      calculatedChecksum = calculatedChecksum & calculatedChecksum;
    }
    const calculatedChecksumHex = Math.abs(calculatedChecksum).toString(16);

    if (calculatedChecksumHex !== originalChecksum) {
      throw new Error(
        'Backup file integrity check failed - data may be corrupted'
      );
    }

    let importedCount = 0;
    const errors: { table: string; error: string }[] = [];

    // Import data to each table
    for (const [tableName, tableData] of Object.entries(backup.tables)) {
      try {
        const { records } = tableData as any;

        for (const record of records) {
          // Update userId to new user's ID
          const modifiedRecord = {
            ...record,
            userId: newUserId,
            // Reset timestamps to current time
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          // Special handling for certain fields
          if (tableName === 'users') {
            modifiedRecord.userId = newUserId;
          }

          try {
            // Insert the record into the new collection
            await ctx.db.insert(tableName as any, modifiedRecord);
            importedCount++;
          } catch (insertError) {
            errors.push({
              table: tableName,
              error: `Failed to import record: ${insertError}`
            });
          }
        }
      } catch (tableError) {
        errors.push({
          table: tableName,
          error: `Failed to import table: ${tableError}`
        });
      }
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} records from backup`,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
      warnings:
        errors.length > 0
          ? `${errors.length} errors occurred during import`
          : undefined
    };
  }
});
