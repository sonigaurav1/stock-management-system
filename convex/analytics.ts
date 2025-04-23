import { v } from 'convex/values';
import { query } from './_generated/server';

// Dashboard

// Get total revenue
export const getTotalRevenueWithComparison = query({
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error('Not authenticated');
      }
      const userId = identity.subject;

      // Calculate date ranges as timestamps
      const now = new Date();
      const currentMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).getTime();

      const prevMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).getTime();
      const prevMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      ).getTime();

      // Get current month sales
      const currentMonthSales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .filter((q) =>
          q.and(
            q.gte(q.field('soldAt'), currentMonthStart),
            q.lte(q.field('soldAt'), currentMonthEnd)
          )
        )
        .collect();

      // Get previous month sales
      const previousMonthSales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .filter((q) =>
          q.and(
            q.gte(q.field('soldAt'), prevMonthStart),
            q.lte(q.field('soldAt'), prevMonthEnd)
          )
        )
        .collect();

      // Calculate totals
      const currentMonthRevenue = currentMonthSales.reduce(
        (acc, sale) => acc + sale.totalAmount,
        0
      );

      const previousMonthRevenue = previousMonthSales.reduce(
        (acc, sale) => acc + sale.totalAmount,
        0
      );

      // Calculate percentage change
      const revenuePercentageChange =
        previousMonthRevenue === 0
          ? null
          : ((currentMonthRevenue - previousMonthRevenue) /
              previousMonthRevenue) *
            100;

      return {
        currentMonthRevenue,
        previousMonthRevenue,
        revenuePercentageChange
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating revenue comparison:', error);
      throw new Error('Failed to calculate revenue comparison');
    }
  }
});

// Get total sales
export const getTotalSalesWithComparison = query({
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error('Not authenticated');
      }
      const userId = identity.subject;

      // Calculate date ranges as timestamps
      const now = new Date();
      const currentMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).getTime();

      const prevMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).getTime();
      const prevMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      ).getTime();

      // Get current month sales
      const currentMonthSales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .filter((q) =>
          q.and(
            q.gte(q.field('soldAt'), currentMonthStart),
            q.lte(q.field('soldAt'), currentMonthEnd)
          )
        )
        .collect();

      // Get previous month sales
      const previousMonthSales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .filter((q) =>
          q.and(
            q.gte(q.field('soldAt'), prevMonthStart),
            q.lte(q.field('soldAt'), prevMonthEnd)
          )
        )
        .collect();

      // Calculate totals
      const currentMonthSalesCount = currentMonthSales.length;
      const previousMonthSalesCount = previousMonthSales.length;

      // Calculate percentage change
      const salesPercentageChange =
        previousMonthSalesCount === 0
          ? null
          : ((currentMonthSalesCount - previousMonthSalesCount) /
              previousMonthSalesCount) *
            100;

      return {
        currentMonthSalesCount,
        previousMonthSalesCount,
        salesPercentageChange
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating sales comparison:', error);
      throw new Error('Failed to calculate sales comparison');
    }
  }
});

// Get total customers with comparison
export const getTotalCustomersWithComparison = query({
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error('Not authenticated');
      }
      const userId = identity.subject;

      // Calculate date ranges as timestamps
      const now = new Date();
      const currentMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).getTime();

      const prevMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).getTime();
      const prevMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      ).getTime();

      // Get current month customers
      const currentMonthCustomers = await ctx.db
        .query('customers')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .filter((q) =>
          q.and(
            q.gte(q.field('createdAt'), currentMonthStart),
            q.lte(q.field('createdAt'), currentMonthEnd)
          )
        )
        .collect();

      // Get previous month customers
      const previousMonthCustomers = await ctx.db
        .query('customers')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .filter((q) =>
          q.and(
            q.gte(q.field('createdAt'), prevMonthStart),
            q.lte(q.field('createdAt'), prevMonthEnd)
          )
        )
        .collect();

      // Calculate totals
      const currentMonthCustomerCount = currentMonthCustomers.length;
      const previousMonthCustomerCount = previousMonthCustomers.length;

      // Calculate percentage change
      const customerPercentageChange =
        previousMonthCustomerCount === 0
          ? null
          : ((currentMonthCustomerCount - previousMonthCustomerCount) /
              previousMonthCustomerCount) *
            100;

      return {
        currentMonthCustomerCount,
        previousMonthCustomerCount,
        customerPercentageChange
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating customer comparison:', error);
      throw new Error('Failed to calculate customer comparison');
    }
  }
});

//  Get recent sales and total sales count for this month
export const getRecentSalesAndMonthlyTotal = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not authenticated');
    }
    const userId = identity.subject;

    // Calculate date range for the current month
    const now = new Date();
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    ).getTime();

    const page = args.page ?? 0;
    const pageSize = args.pageSize ?? 5;

    // Get paginated sales for the current month using offset pagination
    const recentSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field('soldAt'), currentMonthStart),
          q.lte(q.field('soldAt'), currentMonthEnd)
        )
      )
      .order('desc')
      .collect();

    // Calculate offset pagination manually
    const startIdx = page * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedSales = recentSales.slice(startIdx, endIdx);

    // Check if there are more results
    const hasMore = endIdx < recentSales.length;

    return {
      recentSales: paginatedSales,
      hasMore,
      totalMonthlySales: recentSales.length
    };
  }
});

// // Get all sales
export const getAllSales = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error('Not authenticated');
    }
    const userId = identity.subject;

    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    return sales;
  }
});

// // Get all sales (updated for organization access)
// export const getAllSales = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();

//     if (!identity) {
//       throw new Error('Not authenticated');
//     }
//     const userId = identity.subject;

//     // First, find all organizations this user belongs to
//     const memberships = await ctx.db
//       .query("organizationMembers")
//       .withIndex("by_user", q => q.eq("userId", userId))
//       .collect();

//     // If user doesn't belong to any org, just show their own sales
//     if (memberships.length === 0) {
//       const sales = await ctx.db
//         .query('sales')
//         .withIndex('by_user_and_isDeleted', (q) =>
//           q.eq('userId', userId).eq('isDeleted', false)
//         )
//         .collect();
//       return sales;
//     }

//     // Get all sales from organizations the user belongs to
//     type Sale = {
//       userId: string;
//       totalAmount: number;
//       soldAt: number;
//       isDeleted: boolean;
//     };
//     let allSales: Array<Sale> = [];
//     for (const membership of memberships) {
//       // Get the organization
//       const organization = await ctx.db.get(membership.organizationId);

//       if (!organization) {
//         continue; // Skip this membership if the organization is null
//       }

//       // Get sales for the organization owner (replace userId with ownerId)
//       const orgSales = await ctx.db
//         .query('sales')
//         .withIndex('by_user_and_isDeleted', (q) =>
//           q.eq('userId', organization.ownerId).eq('isDeleted', false)
//         )
//         .collect();

//       allSales = [...allSales, ...orgSales];
//     }

//     return allSales;
//   }
// });
