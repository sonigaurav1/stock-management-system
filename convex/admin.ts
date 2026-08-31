import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

const DATABASE_TABLES = [
  'users',
  'products',
  'category',
  'suppliers',
  'stockMovements',
  'sales',
  'customers',
  'invoices',
  'companies',
  'transactions',
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
  'dashboardExports'
];

// ============ RBAC PERMISSION CHECKS ============
// Super-admin check: Only super-admins can perform destructive operations
const requireSuperAdmin = async (ctx: any) => {
  // TEMPORARY DEVELOPMENT BYPASS - CHANGE TO false TO REQUIRE AUTHENTICATION
  const DEV_BYPASS_AUTH = true; // 🔴 SET TO false TO ENABLE AUTHENTICATION

  // Check if authentication is disabled for dev routes
  const envVar1 = process.env.NEXT_PUBLIC_DEV_ONLY_ROUTE_NO_AUTH;
  const envVar2 = process.env.DEV_ONLY_ROUTE_NO_AUTH;
  const nodeEnv = process.env.NODE_ENV;
  const vercelEnv = process.env.VERCEL_ENV;

  const isDevAuthDisabled =
    DEV_BYPASS_AUTH || // Simple toggle
    envVar1 === 'true' ||
    envVar2 === 'true';
  const isDevelopment = nodeEnv !== 'production' && vercelEnv !== 'production';

  if (isDevAuthDisabled && isDevelopment) {
    // In development with auth disabled, allow access without authentication
    return { subject: 'dev-user', name: 'Development User' };
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthorized: Not authenticated.');
  }

  const superAdminIds =
    process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',').map((id) =>
      id.trim()
    ) || [];
  if (!superAdminIds.includes(identity.subject)) {
    throw new Error('Unauthorized: Only super admins can perform this action.');
  }

  return identity;
};

// Old helper (kept for compatibility during transition)
const checkAdminAccess = requireSuperAdmin;

// ============ DATABASE STATISTICS ============
export const getDatabaseStatistics = query({
  handler: async (ctx) => {
    // Only super-admins can view database statistics
    await requireSuperAdmin(ctx);

    const stats: any[] = [];

    for (const tableName of DATABASE_TABLES) {
      try {
        const db = ctx.db as any;
        const records = await db.query(tableName).collect();

        stats.push({
          name: tableName,
          documentCount: records.length,
          status: 'active',
          lastUpdated: records.length > 0 ? 'Recently' : 'No data',
          avgSize:
            records.length > 0
              ? Math.round(JSON.stringify(records).length / records.length)
              : 0,
          indexed: true
        });
      } catch (error) {
        stats.push({
          name: tableName,
          documentCount: 0,
          status: 'error',
          lastUpdated: 'N/A',
          avgSize: 0,
          indexed: false
        });
      }
    }

    return {
      tables: stats.sort((a, b) => b.documentCount - a.documentCount),
      totalTables: DATABASE_TABLES.length,
      totalDocuments: stats.reduce((sum, t) => sum + t.documentCount, 0),
      timestamp: new Date().toISOString()
    };
  }
});

export const getTableDocuments = query({
  args: {
    tableName: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { tableName, limit = 100 }) => {
    // Only super-admins can view table documents
    await requireSuperAdmin(ctx);

    if (!DATABASE_TABLES.includes(tableName)) {
      throw new Error(`Invalid table: ${tableName}`);
    }

    const db = ctx.db as any;
    const records = await db.query(tableName).collect();
    const limitedRecords = records.slice(0, Math.max(1, Math.min(limit, 500)));

    return {
      tableName,
      totalCount: records.length,
      returnedCount: limitedRecords.length,
      data: limitedRecords
    };
  }
});

// ============ DELETE TABLE DATA ============
export const deleteAllDocuments = mutation({
  args: {
    tableName: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { tableName, limit = 50 }) => {
    // CRITICAL: Only super-admins can delete all documents from a table
    await requireSuperAdmin(ctx);

    // Add validation to prevent accidental deletion
    if (!DATABASE_TABLES.includes(tableName)) {
      throw new Error(`Invalid table: ${tableName}`);
    }

    const db = ctx.db as any;
    // Process in batches to stay under 4096 read limit.
    // Each .delete() is a read. limit=50 => ~50 reads for query + 50 reads for deletes = ~51 total.
    const records = await db.query(tableName).take(limit);

    let deletedCount = 0;
    for (const record of records) {
      await db.delete(record._id);
      deletedCount++;
    }

    const hasMore = records.length === limit;

    if (deletedCount > 0) {
      console.warn(
        `[ADMIN] User deleted ${deletedCount} documents from ${tableName} (hasMore=${hasMore})`
      );
    }

    return {
      success: true,
      message: `Deleted ${deletedCount} documents from ${tableName}`,
      deletedCount,
      hasMore
    };
  }
});

// ============ DELETE ALL TABLES ============
// NOTE: This mutation processes ONE table per invocation to avoid the 4096 read limit.
// The frontend must call it repeatedly with nextTableIndex until all tables are cleared.
export const deleteAllTables = mutation({
  args: {
    tableIndex: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { tableIndex = 0, limit = 50 }) => {
    // CRITICAL: EXTREME DANGER - Only super-admins with explicit intent
    await requireSuperAdmin(ctx);

    const db = ctx.db as any;
    const tables = [
      'products',
      'suppliers',
      'category',
      'productSuppliers',
      'stockMovements',
      'sales',
      'payments',
      'customers',
      'invoices',
      'recurringInvoices',
      'firms',
      'expenses',
      'transactions',
      'companyDetails',
      'otpVerification',
      'userSettings',
      'organizations',
      'organizationMembers',
      'accountStatus',
      'companyMembers',
      'customRoles',
      'rolePermissions',
      'companySettings',
      'notificationRules',
      'integrations',
      'apiKeys',
      'webhooks',
      'automationRules',
      'auditLog',
      'webhookExecutions',
      'failedWebhooks',
      'securityLogs',
      'performanceMetrics',
      'systemHealth',
      'complianceCertifications',
      'gdprRequests',
      'dashboardWidgets',
      'insightSettings',
      'notificationPreferences',
      'users'
    ];

    if (tableIndex >= tables.length) {
      return {
        success: true,
        message: 'All tables cleared',
        deletedCount: 0,
        hasMore: false,
        nextTableIndex: tableIndex,
        currentTable: null
      };
    }

    const currentTable = tables[tableIndex];
    let deletedCount = 0;
    let hasMoreInTable = true;

    try {
      // Process one batch from the current table (limit=50 keeps us well under 4096 reads)
      const records = await db.query(currentTable).take(limit);
      for (const record of records) {
        await db.delete(record._id);
        deletedCount++;
      }
      hasMoreInTable = records.length === limit;
    } catch (error) {
      console.error(`[ADMIN] Error deleting from ${currentTable}:`, error);
    }

    const nextTableIndex = hasMoreInTable ? tableIndex : tableIndex + 1;
    const hasMore = nextTableIndex < tables.length || hasMoreInTable;

    if (deletedCount > 0) {
      console.warn(
        `[ADMIN] Deleted ${deletedCount} from ${currentTable} (tableIndex=${tableIndex}, hasMore=${hasMore})`
      );
    }

    return {
      success: true,
      message: `Deleted ${deletedCount} from ${currentTable}`,
      deletedCount,
      hasMore,
      nextTableIndex,
      currentTable
    };
  }
});

// ============ DELETE SINGLE DOCUMENT ============
export const deleteDocumentById = mutation({
  args: {
    tableName: v.string(),
    docId: v.string()
  },
  handler: async (ctx, { tableName, docId }) => {
    // Only super-admins can directly delete by ID
    await requireSuperAdmin(ctx);

    if (!DATABASE_TABLES.includes(tableName)) {
      throw new Error(`Invalid table: ${tableName}`);
    }

    if (!docId) {
      throw new Error('Document ID is required');
    }

    try {
      const db = ctx.db as any;
      // Use db.delete directly with the string ID
      await db.delete(docId as any);

      console.warn(`[ADMIN] Deleted document ${docId} from ${tableName}`);

      return {
        success: true,
        message: `Document deleted from ${tableName}`,
        docId
      };
    } catch (error) {
      throw new Error(
        `Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
});

// ============ ANALYTICS ============
export const getAnalyticsData = query({
  args: { months: v.optional(v.number()) },
  handler: async (ctx, { months = 6 }) => {
    // Only super-admins can view system-wide analytics
    await requireSuperAdmin(ctx);

    // TODO: Replace with real data from your database
    // Example: const sales = await ctx.db.query('sales').collect();

    return {
      revenueData: [
        { month: 'Jan', revenue: 45000, orders: 240, customers: 1200 },
        { month: 'Feb', revenue: 52000, orders: 290, customers: 1400 },
        { month: 'Mar', revenue: 48000, orders: 280, customers: 1300 },
        { month: 'Apr', revenue: 61000, orders: 340, customers: 1600 },
        { month: 'May', revenue: 55000, orders: 310, customers: 1500 },
        { month: 'Jun', revenue: 67000, orders: 380, customers: 1800 }
      ],
      categoryData: [
        { name: 'Electronics', value: 35, fill: '#3b82f6' },
        { name: 'Clothing', value: 25, fill: '#10b981' },
        { name: 'Home & Garden', value: 20, fill: '#f59e0b' },
        { name: 'Books', value: 15, fill: '#8b5cf6' },
        { name: 'Other', value: 5, fill: '#ef4444' }
      ],
      userActivityData: [
        { hour: '00:00', users: 120, sessions: 80 },
        { hour: '04:00', users: 45, sessions: 30 },
        { hour: '08:00', users: 230, sessions: 150 },
        { hour: '12:00', users: 450, sessions: 280 },
        { hour: '16:00', users: 520, sessions: 320 },
        { hour: '20:00', users: 380, sessions: 220 }
      ]
    };
  }
});

// ============ KPI METRICS ============
export const getKPIMetrics = query({
  handler: async (ctx) => {
    // Only super-admins can view system KPI metrics
    await requireSuperAdmin(ctx);

    // TODO: Calculate real metrics from database
    // const totalUsers = await ctx.db.query('users').collect();
    // const activeUsers = totalUsers.filter(u => u.lastActive > now - 24h);

    return {
      revenue: {
        value: '$2.45M',
        change: 12.5,
        trend: 'up'
      },
      activeUsers: {
        value: '1,234',
        change: 8.3,
        trend: 'up'
      },
      orders: {
        value: '5,890',
        change: -2.1,
        trend: 'down'
      },
      inventoryValue: {
        value: '$780K',
        change: 5.7,
        trend: 'up'
      },
      systemStatus: 'operational',
      uptime: '99.9%',
      pendingTasks: 42,
      activeAlerts: 3
    };
  }
});

// ============ TEAM MANAGEMENT ============
export const getTeamMembers = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, { role }) => {
    // Only super-admins can view all team members
    await requireSuperAdmin(ctx);

    // TODO: Query real team members from database
    // const members = await ctx.db.query('users')
    //   .filter(u => !role || u.role === role)
    //   .collect();

    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'owner',
        department: 'Executive',
        status: 'active',
        joinedDate: '2023-01-15',
        lastActive: '2 minutes ago'
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        role: 'admin',
        department: 'Operations',
        status: 'active',
        joinedDate: '2023-02-20',
        lastActive: '15 minutes ago'
      }
    ];
  }
});

export const inviteTeamMember = mutation({
  args: {
    email: v.string(),
    role: v.string(),
    department: v.string()
  },
  handler: async (ctx, { email, role, department }) => {
    // Only super-admins can invite team members
    await requireSuperAdmin(ctx);

    // Validate email
    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // TODO: Send invitation email and create user record
    // const invites = await ctx.db.collection('invitations');
    // await invites.insert({ email, role, department, createdAt: Date.now() });

    console.log(`[ADMIN] Invitation sent to ${email} with role ${role}`);

    return {
      success: true,
      message: `Invitation sent to ${email}`
    };
  }
});

export const updateTeamMemberRole = mutation({
  args: {
    userId: v.string(),
    newRole: v.string()
  },
  handler: async (ctx, { userId, newRole }) => {
    // Only super-admins can update team member roles
    await requireSuperAdmin(ctx);

    if (!userId || !newRole) {
      throw new Error('userId and newRole are required');
    }

    // TODO: Update user role in database
    // const user = await ctx.db.get(userId);
    // await ctx.db.patch(userId, { role: newRole });

    console.log(`[ADMIN] Role updated for user ${userId} to ${newRole}`);

    return { success: true };
  }
});

export const removeTeamMember = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Only super-admins can remove team members
    await requireSuperAdmin(ctx);

    if (!userId) {
      throw new Error('userId is required');
    }

    // TODO: Remove user from organization
    // await ctx.db.delete(userId);

    console.log(`[ADMIN] Team member ${userId} removed`);

    return { success: true };
  }
});

// ============ AUDIT LOGS ============
export const getAuditLogs = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { category, status, limit = 50 }) => {
    // Only super-admins can view audit logs
    await requireSuperAdmin(ctx);

    // TODO: Query audit logs from database with filters
    // const logs = await ctx.db.query('auditLogs')
    //   .filter(l => !category || l.category === category)
    //   .filter(l => !status || l.status === status)
    //   .order('desc')
    //   .take(limit);

    return [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'Sarah Johnson',
        email: 'sarah@example.com',
        action: 'User Created',
        category: 'user',
        resource: 'User #234',
        status: 'success',
        details: 'New admin user created',
        ipAddress: '192.168.1.1'
      }
    ];
  }
});

export const logAuditEntry = mutation({
  args: {
    user: v.string(),
    action: v.string(),
    category: v.string(),
    resource: v.string(),
    details: v.string(),
    status: v.string()
  },
  handler: async (ctx, args) => {
    // Only super-admins can log audit entries (typically called from other mutations)
    await requireSuperAdmin(ctx);

    // TODO: Insert audit log entry
    // const logs = ctx.db.collection('auditLogs');
    // await logs.insert({ ...args, timestamp: Date.now() });

    return { success: true };
  }
});

export const getAuditStats = query({
  handler: async (ctx) => {
    // Only super-admins can view audit statistics
    await requireSuperAdmin(ctx);

    // TODO: Calculate stats from audit logs
    // const logs = await ctx.db.query('auditLogs').collect();

    return {
      totalActions: 12543,
      thisMonth: 2345,
      failedActions: 23,
      alerts: 5
    };
  }
});

// ============ COMPANY MANAGEMENT ============
export const getCompanyDetails = query({
  handler: async (ctx) => {
    // Only super-admins can view company details
    await requireSuperAdmin(ctx);

    // TODO: Query company details from database
    // const company = await ctx.db.query('company').first();

    return {
      companyName: 'Acme Corporation',
      email: 'info@acmecorp.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business Ave, Tech City, 54321',
      registrationNumber: 'REG123456',
      status: 'active',
      verificationStatus: 'verified',
      accountTier: 'enterprise',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
      subscriptionRenewal: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
      taxYearEnd: new Date(Date.now() + 256 * 24 * 60 * 60 * 1000)
    };
  }
});

export const updateCompanyDetails = mutation({
  args: {
    companyName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Only super-admins can update company details
    await requireSuperAdmin(ctx);

    // TODO: Update company details
    // const company = await ctx.db.query('company').first();
    // if (company) await ctx.db.patch(company._id, args);

    console.log('[ADMIN] Company details updated');

    return { success: true };
  }
});

export const getComplianceStatus = query({
  handler: async (ctx) => {
    // Only super-admins can view compliance status
    await requireSuperAdmin(ctx);

    // TODO: Query compliance certifications
    // const compliance = await ctx.db.query('compliance').first();

    return {
      gdprCompliant: true,
      pciDssCertified: true,
      iso27001Certified: true,
      dataEncryption: 'AES-256',
      backupFrequency: 'Daily',
      disasterRecoveryPlan: 'Active'
    };
  }
});

// ============ SYSTEM SETTINGS ============
export const getSystemSettings = query({
  handler: async (ctx) => {
    // Only super-admins can view system settings
    await requireSuperAdmin(ctx);

    // TODO: Query system settings from database
    // const settings = await ctx.db.query('settings').first();

    return {
      companyName: 'Acme Corporation',
      timezone: 'UTC',
      language: 'English',
      features: {
        advancedReporting: true,
        multiTenancy: true,
        apiAccess: true,
        webhooks: false
      },
      security: {
        twoFactorAuth: false,
        sso: false,
        sessionTimeout: 30,
        passwordMinLength: 12,
        ipWhitelistEnabled: false
      },
      notifications: {
        userSignup: true,
        orderConfirmation: true,
        systemAlerts: true,
        dailySummary: false
      },
      integrations: {
        stripe: { connected: true },
        slack: { connected: false },
        googleAnalytics: { connected: true },
        mailchimp: { connected: false }
      }
    };
  }
});

export const updateSystemSettings = mutation({
  args: {
    setting: v.string(),
    value: v.any()
  },
  handler: async (ctx, { setting, value }) => {
    // Only super-admins can update system settings
    await requireSuperAdmin(ctx);

    if (!setting) {
      throw new Error('Setting name is required');
    }

    // TODO: Update system settings
    // const settings = await ctx.db.query('settings').first();
    // if (settings) await ctx.db.patch(settings._id, { [setting]: value });

    console.log(`[ADMIN] System setting '${setting}' updated`);

    return { success: true };
  }
});

// ============ DATA EXPORT ============
export const exportData = mutation({
  args: {
    dataType: v.string(),
    format: v.string(),
    dateRange: v.string(),
    compression: v.optional(v.string())
  },
  handler: async (ctx, { dataType, format, dateRange, compression }) => {
    // Only super-admins can export system data
    await requireSuperAdmin(ctx);

    // TODO: Generate and return export file
    // This should trigger async job for large exports
    // TODO: Log this export to audit log

    console.log(
      `[ADMIN] Data export requested: type=${dataType}, format=${format}`
    );

    return {
      success: true,
      fileName: `export_${Date.now()}.${format}`,
      downloadUrl: `/api/exports/${Date.now()}`,
      status: 'ready'
    };
  }
});

export const getRecentExports = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    // Only super-admins can view recent exports
    await requireSuperAdmin(ctx);

    // TODO: Query recent exports from database
    // const exports = await ctx.db.query('exports')
    //   .order('desc')
    //   .take(limit);

    return [
      {
        name: 'sales_report_april_2026.csv',
        size: '2.4 MB',
        date: 'Apr 18, 2026',
        format: 'csv'
      }
    ];
  }
});

export const scheduleExport = mutation({
  args: {
    name: v.string(),
    schedule: v.string(),
    dataType: v.string(),
    format: v.string()
  },
  handler: async (ctx, args) => {
    // Only super-admins can schedule exports
    await requireSuperAdmin(ctx);

    // TODO: Create scheduled export job
    // const schedules = ctx.db.collection('scheduledExports');
    // await schedules.insert(args);

    console.log(`[ADMIN] Export scheduled: ${args.name}`);

    return { success: true };
  }
});

// ============ REPORTS ============
export const generateReport = mutation({
  args: {
    reportType: v.string(),
    format: v.string(),
    dateRange: v.optional(v.string())
  },
  handler: async (ctx, { reportType, format, dateRange }) => {
    // Only super-admins can generate system reports
    await requireSuperAdmin(ctx);

    if (!reportType || !format) {
      throw new Error('reportType and format are required');
    }

    // TODO: Generate report based on type
    // Sales, Inventory, User Analytics, etc.
    // TODO: Log report generation to audit log

    console.log(
      `[ADMIN] Report generated: type=${reportType}, format=${format}`
    );

    return {
      success: true,
      reportId: `report_${Date.now()}`,
      downloadUrl: `/api/reports/${Date.now()}`,
      status: 'generating'
    };
  }
});

export const getReportHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    // Only super-admins can view report history
    await requireSuperAdmin(ctx);

    // TODO: Query generated reports history
    // const reports = await ctx.db.query('reports')
    //   .order('desc')
    //   .take(limit);

    return [];
  }
});

// ============ Demo Data Seeder (Development Only) ============
export const createDemoDashboardData = mutation({
  args: {
    customerCount: v.number(),
    lastMonthCustomerCount: v.optional(v.number()),
    revenueAmount: v.number(),
    lastMonthRevenue: v.optional(v.number()),
    productCount: v.number(),
    salesRecords: v.number(),
    scenarioName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Demo data creation not allowed in production');
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;
    const now = new Date();

    try {
      // Create sample customers
      for (let i = 0; i < args.customerCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = now.getTime() - daysAgo * 24 * 60 * 60 * 1000;

        await ctx.db.insert('customers', {
          userId,
          name: `Demo Customer ${i + 1}`,
          email: `demo${i + 1}@example.com`,
          phone: [`555-${String(i).padStart(4, '0')}`],
          address: `${i} Demo Street`,
          createdAt,
          isDeleted: false
        });
      }

      // Create sample products
      for (let i = 0; i < args.productCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = now.getTime() - daysAgo * 24 * 60 * 60 * 1000;
        const categories = ['Electronics', 'Clothing', 'Food', 'Books'];
        const categoryName = categories[i % 4];
        const stockLevel = Math.floor(Math.random() * 500);
        const stockStatus =
          stockLevel > 100
            ? 'in_stock'
            : stockLevel > 10
              ? 'low_stock'
              : 'out_of_stock';

        await ctx.db.insert('products', {
          userId,
          name: `Demo Product ${i + 1}`,
          sku: `DEMO-SKU-${String(i + 1).padStart(5, '0')}`,
          slug: `demo-product-${i + 1}`,
          categoryName,
          categoryId: `cat_${i % 4}`,
          stockLevel,
          inStock: stockLevel > 0,
          stockStatus,
          sellingPrice: Math.random() * 1000 + 10,
          createdAt,
          isDeleted: false
        });
      }

      // Create sample sales records
      for (let i = 0; i < args.salesRecords; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const soldAt = now.getTime() - daysAgo * 24 * 60 * 60 * 1000;
        const quantitySold = Math.floor(Math.random() * 20) + 1;
        const sellingPrice = Math.random() * 1000 + 10;
        const totalAmount = quantitySold * sellingPrice;

        await ctx.db.insert('sales', {
          userId,
          quantitySold,
          sellingPrice,
          totalAmount,
          customerName: `Demo Customer ${(i % Math.max(args.customerCount, 1)) + 1}`,
          customerPhone: [`555-${String(i % 10000).padStart(4, '0')}`],
          paymentStatus: (['paid', 'unpaid', 'partially_paid'] as const)[
            Math.floor(Math.random() * 3)
          ],
          soldAt,
          isDeleted: false
        });
      }

      return {
        success: true,
        scenario: args.scenarioName || 'Unknown',
        created: {
          customers: args.customerCount,
          products: args.productCount,
          sales: args.salesRecords
        }
      };
    } catch (error) {
      console.error('[DEMO DATA ERROR]', error);
      throw new Error(`Failed to create demo data: ${String(error)}`);
    }
  }
});

export const clearDemoDashboardData = mutation({
  args: {
    table: v.optional(
      v.union(v.literal('customers'), v.literal('products'), v.literal('sales'))
    )
  },
  handler: async (ctx, args) => {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Demo data clearing not allowed in production');
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;

    // Process only one table per invocation to stay under the 4096 read limit.
    // The frontend calls this repeatedly (once per table) until all are empty.
    const tableToClear = args.table ?? 'customers';
    const BATCH_SIZE = 50; // 50 reads for query + 50 reads for patches = ~51 reads total (safe under 4096)

    let deletedCount = 0;
    let hasMore = false;

    const clearBatch = async (tableName: string) => {
      const items = await ctx.db
        .query(tableName as any)
        .withIndex('by_user_and_isDeleted', (q) => q.eq('userId', userId))
        .filter((q) => q.eq(q.field('isDeleted'), false))
        .take(BATCH_SIZE);

      if (items.length === 0) {
        return { deleted: 0, hasMore: false };
      }

      for (const item of items) {
        await ctx.db.patch(item._id, { isDeleted: true });
      }

      return { deleted: items.length, hasMore: items.length === BATCH_SIZE };
    };

    try {
      const result = await clearBatch(tableToClear);
      deletedCount = result.deleted;
      hasMore = result.hasMore;

      console.log(
        `[DEMO DATA CLEAR] table=${tableToClear} deleted=${deletedCount} hasMore=${hasMore}`
      );

      return {
        success: true,
        deletedCount,
        table: tableToClear,
        hasMore,
        message: hasMore
          ? `Cleared ${deletedCount} from ${tableToClear}, more remaining`
          : `Cleared ${deletedCount} from ${tableToClear}, table empty`
      };
    } catch (error) {
      console.error('[DEMO DATA CLEAR ERROR]', error);
      throw new Error(`Failed to clear demo data: ${String(error)}`);
    }
  }
});

// ============ Legacy Admin Function ============
export const adminOnlyFunction = mutation(async ({ db, auth }) => {
  // DEPRECATED: Use the RBAC pattern instead
  // This is here for backward compatibility only
  const user = await auth.getUserIdentity();
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

  if (user?.id !== ADMIN_USER_ID) {
    throw new Error('Unauthorized: Only admins can perform this action.');
  }

  // Admin-only logic here
  return { message: 'Admin action performed successfully.' };
});
