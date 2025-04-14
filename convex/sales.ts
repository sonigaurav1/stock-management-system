import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createSale = mutation({
  args: {
    productId: v.id('products'),
    customerId: v.id('customers'),
    customerName: v.string(),
    customerPhone: v.array(v.string()),
    quantitySold: v.number(),
    paymentStatus: v.string(),
    sellingPrice: v.number(),
    totalAmount: v.number(),
    soldAt: v.number()
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db.insert('sales', {
      ...args,
      userId,
      isDeleted: false
    });
  }
});
