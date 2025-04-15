import { query } from './_generated/server';

// Get top 5 best selling products
export const getTopSellingProducts = query({
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        throw new Error('Not authenticated');
      }
      const userId = identity.subject;

      // Get all sales for this user that are not deleted
      const sales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .collect();

      // Group by product name and count occurrences
      const productSales: {
        [key: string]: { totalSold: number; productId: string };
      } = {};

      for (const sale of sales) {
        if (sale.productId) {
          let productName = '';
          if (sale.productId.includes('temp_')) {
            // Extract name from productId
            const tempName = sale.productId.split('_').slice(3).join(',');
            productName = tempName.split(',').join(' ');
          } else {
            // Try to get the product details
            const product = await ctx.db
              .query('products')
              .withIndex('by_user_and_isDeleted', (q) =>
                q.eq('userId', userId).eq('isDeleted', false)
              )
              .filter((q) => q.eq(q.field('_id'), sale.productId))
              .first();

            productName = product?.name || 'Unknown Product';
          }

          // Combine sales for products with the same name
          if (productSales[productName]) {
            productSales[productName].totalSold += sale.quantitySold;
          } else {
            productSales[productName] = {
              totalSold: sale.quantitySold,
              productId: sale.productId
            };
          }
        }
      }

      // Convert to array for sorting
      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          totalSold: data.totalSold,
          productId: data.productId
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      return topProducts;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating top selling products:', error);
      throw new Error('Failed to calculate top selling products');
    }
  }
});
