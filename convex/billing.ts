import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Stock Management
export const createSale = mutation({
  args: {
    productId: v.id('products'),
    customerId: v.id('customers'),
    customerName: v.string(),
    customerPhone: v.array(v.string()),
    quantitySold: v.number(),
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

export const getCustomerByPanOrPhone = mutation({
  args: {
    pan: v.optional(v.string()),
    phones: v.optional(v.array(v.string())) // Accept an array of phone numbers
  },
  handler: async (ctx, args) => {
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

    return customers.find(
      (customer) =>
        (args.pan && customer.pan === args.pan) ||
        (Array.isArray(args.phones) &&
          Array.isArray(customer.phone ?? []) &&
          args.phones.some((phone) => (customer.phone ?? []).includes(phone))) // Check if any phone matches
    );
  }
});

export const createCustomer = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.array(v.string())), // Accept an array of phone numbers
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    pan: v.optional(v.string()),
    createdAt: v.number()
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db.insert('customers', {
      ...args,
      userId,
      isDeleted: false
    });
  }
});

export const updateProductStock = mutation({
  args: {
    id: v.id('products'),
    updates: v.object({
      stockLevel: v.number(),
      stockStatus: v.union(
        v.literal('in_stock'),
        v.literal('low_stock'),
        v.literal('out_of_stock')
      )
    })
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error('Product not found');
    }

    // // Debugging: Log the stockLevel value
    // // eslint-disable-next-line no-console
    // console.log('Stock Level:', args.updates.stockLevel);

    // // Check if the stockLevel is less than 1
    // if (args.updates.stockLevel < 1) {
    //   throw new Error('Stock level must be at least 1 to update');
    // }

    return await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now()
    });
  }
});

export const getProductByIdBilling = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const product = await ctx.db.get(args.id);
    return product?.isDeleted || product?.userId !== userId ? null : product; // Return null if deleted or not owned by user
  }
});

// Invoice Management
export const createInvoice = mutation({
  args: {
    invoiceData: v.object({
      userId: v.string(),
      transactionDate: v.string(),
      invoiceNumber: v.string(),
      date: v.string(),
      miti: v.string(),
      isAdmin: v.boolean(),
      paymentMode: v.string(),
      buyerName: v.string(),
      buyerAddress: v.string(),
      buyerPhone: v.optional(v.string()),
      buyerPan: v.optional(v.string()),
      items: v.array(
        v.object({
          sn: v.number(),
          hsCode: v.string(),
          description: v.string(),
          quantity: v.number(),
          unit: v.string(),
          rate: v.number(),
          amount: v.number()
        })
      ),
      value: v.number(),
      discount: v.number(),
      nonTaxable: v.number(),
      taxableAmount: v.number(),
      vatAmount: v.number(),
      totalAmount: v.number(),
      amountInWords: v.string(),
      printDate: v.string(),
      printTime: v.string(),
      vehicleNo: v.optional(v.string()),
      remarks: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db.insert('invoices', {
      ...args.invoiceData,
      userId,
      isDeleted: false,
      createdAt: Date.now()
    });
  }
});

export const getInvoiceByInvoiceNumber = query({
  args: { invoiceNumber: v.string() },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const invoices = await ctx.db
      .query('invoices')
      .withIndex('by_user_and_invoiceNumber', (q) =>
        q.eq('userId', userId).eq('invoiceNumber', args.invoiceNumber)
      )
      .collect();

    return invoices.length > 0 ? invoices[0] : null;
  }
});
