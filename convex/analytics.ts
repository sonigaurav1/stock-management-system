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

//  Get 5 recent sales and total sales count for this month
export const getRecentSalesAndMonthlyTotal = query({
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

    // Sort sales in descending order based on the soldAt date
    const sortedSales = sales.sort(
      (a: any, b: any) =>
        new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime()
    );

    // Get the first 5 sales
    const recentSales = sortedSales.slice(0, 5);

    // Calculate total sales for the current month
    const currentMonth = new Date().getMonth();
    const totalMonthlySales = sortedSales.filter(
      (sale: any) => new Date(sale.soldAt).getMonth() === currentMonth
    ).length;

    return { recentSales, totalMonthlySales };
  }
});

// Get all sales
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
