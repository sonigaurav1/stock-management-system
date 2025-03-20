import { query } from './_generated/server';

// Dashboard

// Get total revenue
export const getTotalRevenue = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    return totalRevenue;
  }
});

// Get total sales
export const getTotalSales = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    return sales.length;
  }
});

// Get total customers
export const getTotalCustomers = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const customers = await ctx.db
      .query('customers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    return customers.length;
  }
});

//  Get 5 recent sales and total sales count for this month
export const getRecentSalesAndMonthlyTotal = query({
  handler: async (ctx) => {
    const sales = await ctx.db
      .query('sales')
      .filter((sale: any) => sale.isDeleted !== false) // Ensure filtering is done here
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
