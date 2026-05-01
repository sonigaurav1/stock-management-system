import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import {
  getOrCreateInventoryRow,
  syncProductStockFromLocationRows
} from './locations';

export const transferStock = mutation({
  args: {
    productId: v.id('products'),
    fromLocationId: v.id('locations'),
    toLocationId: v.id('locations'),
    quantity: v.number(),
    notes: v.optional(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    if (args.fromLocationId === args.toLocationId) {
      throw new Error('Source and destination must differ');
    }
    if (args.quantity <= 0) throw new Error('Invalid quantity');

    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId || product.isDeleted) {
      throw new Error('Product not found');
    }

    const fromLoc = await ctx.db.get(args.fromLocationId);
    const toLoc = await ctx.db.get(args.toLocationId);
    if (
      !fromLoc ||
      !toLoc ||
      fromLoc.userId !== userId ||
      toLoc.userId !== userId
    ) {
      throw new Error('Invalid location');
    }
    if (!fromLoc.isActive || !toLoc.isActive)
      throw new Error('Inactive location');

    const pid = args.productId as string;
    const now = Date.now();

    let fromRow = await ctx.db
      .query('locationInventory')
      .withIndex('by_user_product_location', (q) =>
        q
          .eq('userId', userId)
          .eq('productId', pid)
          .eq('locationId', args.fromLocationId)
      )
      .first();

    if (!fromRow) {
      fromRow = await getOrCreateInventoryRow(
        ctx,
        userId,
        pid,
        args.fromLocationId
      );
    }

    const allRows = await ctx.db
      .query('locationInventory')
      .withIndex('by_user_product', (q) =>
        q.eq('userId', userId).eq('productId', pid)
      )
      .collect();
    const sumRows = allRows.reduce((s, r) => s + r.quantity, 0);
    if (sumRows === 0 && (product.stockLevel ?? 0) > 0) {
      if (fromRow) {
        await ctx.db.patch(fromRow._id, {
          quantity: product.stockLevel ?? 0,
          updatedAt: now
        });
        fromRow = (await ctx.db.get(fromRow._id))!;
      }
    }

    if (!fromRow || fromRow.quantity < args.quantity) {
      throw new Error('Insufficient quantity at source location');
    }

    await ctx.db.patch(fromRow._id, {
      quantity: fromRow.quantity - args.quantity,
      updatedAt: now
    });

    const toRowExisting = await ctx.db
      .query('locationInventory')
      .withIndex('by_user_product_location', (q) =>
        q
          .eq('userId', userId)
          .eq('productId', pid)
          .eq('locationId', args.toLocationId)
      )
      .first();
    if (!toRowExisting) {
      await ctx.db.insert('locationInventory', {
        userId,
        productId: pid,
        locationId: args.toLocationId,
        quantity: args.quantity,
        updatedAt: now
      });
    } else {
      await ctx.db.patch(toRowExisting._id, {
        quantity: toRowExisting.quantity + args.quantity,
        updatedAt: now
      });
    }

    await ctx.db.insert('stockTransfers', {
      userId,
      productId: pid,
      productName: product.name,
      sku: product.sku,
      fromLocationId: args.fromLocationId,
      toLocationId: args.toLocationId,
      quantity: args.quantity,
      status: 'completed',
      notes: args.notes,
      createdAt: now
    });

    await ctx.db.insert('stockMovements', {
      productId: pid,
      userId,
      type: 'transfer',
      quantity: args.quantity,
      reason: `Transfer: ${fromLoc.name} → ${toLoc.name}`,
      referenceId: undefined,
      locationId: args.fromLocationId,
      isDeleted: false,
      createdAt: now
    });

    await syncProductStockFromLocationRows(ctx, userId, pid);
  }
});

export const listStockTransfers = query({
  args: { limit: v.optional(v.number()) },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const rows = await ctx.db
      .query('stockTransfers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows.slice(0, Math.min(args.limit ?? 100, 300));
  }
});
