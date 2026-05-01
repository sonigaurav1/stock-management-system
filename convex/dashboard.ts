import { query } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Resolve effective userId for team members.
 * If user is a team member without their own company, returns owner's userId.
 */
async function resolveEffectiveUserId(
  ctx: any,
  userId: string
): Promise<string> {
  const company = await ctx.db
    .query('companies')
    .withIndex('by_user_and_isDeleted', (q: any) =>
      q.eq('userId', userId).eq('isDeleted', false)
    )
    .first();

  if (company) {
    return userId;
  }

  const teamMembership = await ctx.db
    .query('teamMembers')
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .first();

  if (teamMembership) {
    return teamMembership.userId;
  }

  return userId;
}

// Get top 5 best selling products
export const getTopSellingProducts = query({
  handler: async (ctx) => {
    try {
      const caller = await resolveCallerContext(ctx);
      requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
      const userId = getDataScopeUserId(caller);
      const effectiveUserId = userId;

      // Get all sales for this user that are not deleted
      const sales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', effectiveUserId).eq('isDeleted', false)
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
                q.eq('userId', effectiveUserId).eq('isDeleted', false)
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
