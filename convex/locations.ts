import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

async function requireUser(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  return identity.subject;
}

async function getDefaultLocationDoc(ctx: { db: any }, userId: string) {
  const all = await ctx.db
    .query('locations')
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .collect();
  const active = all.filter((l: { isActive: boolean }) => l.isActive);
  const def = active.find((l: { isDefault: boolean }) => l.isDefault);
  return (
    def ?? active.sort((a: any, b: any) => a.sortOrder - b.sortOrder)[0] ?? null
  );
}

async function getActiveLocations(ctx: { db: any }, userId: string) {
  const all = await ctx.db
    .query('locations')
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .collect();
  return all.filter((l: { isActive: boolean }) => l.isActive);
}

export async function syncProductStockFromLocationRows(
  ctx: { db: any },
  userId: string,
  productId: string
) {
  const product = await ctx.db.get(productId as Id<'products'>);
  if (!product || product.userId !== userId) return;

  const rows = await ctx.db
    .query('locationInventory')
    .withIndex('by_user_product', (q: any) =>
      q.eq('userId', userId).eq('productId', productId)
    )
    .collect();

  if (rows.length === 0) return;

  const sum = rows.reduce(
    (s: number, r: { quantity: number }) => s + r.quantity,
    0
  );
  const reorder = product.reorderLevel ?? 0;
  let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
  if (sum <= 0) stockStatus = 'out_of_stock';
  else if (sum <= reorder) stockStatus = 'low_stock';

  await ctx.db.patch(product._id, {
    stockLevel: sum,
    inStock: sum > 0,
    stockStatus,
    updatedAt: Date.now()
  });
}

export async function getOrCreateInventoryRow(
  ctx: { db: any },
  userId: string,
  productId: string,
  locationId: Id<'locations'>
) {
  const existing = await ctx.db
    .query('locationInventory')
    .withIndex('by_user_product_location', (q: any) =>
      q
        .eq('userId', userId)
        .eq('productId', productId)
        .eq('locationId', locationId)
    )
    .first();
  if (existing) return existing;
  const now = Date.now();
  const id = await ctx.db.insert('locationInventory', {
    userId,
    productId,
    locationId,
    quantity: 0,
    updatedAt: now
  });
  return (await ctx.db.get(id))!;
}

export const getDefaultLocation = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);
    return await getDefaultLocationDoc(ctx, userId);
  }
});

export const listLocations = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);
    const rows = await ctx.db
      .query('locations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }
});

export const ensureDefaultLocationAndMigrate = mutation({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);
    const now = Date.now();

    const existing = await ctx.db
      .query('locations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    let defaultLoc = existing.find((l) => l.isActive && l.isDefault);
    if (existing.length === 0) {
      const id = await ctx.db.insert('locations', {
        userId,
        name: 'Main',
        code: 'MAIN',
        notes: 'Default site — stock migrated from legacy totals',
        isActive: true,
        isDefault: true,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now
      });
      defaultLoc = (await ctx.db.get(id))!;
    } else if (!defaultLoc) {
      const first = existing
        .filter((l) => l.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (first) {
        await ctx.db.patch(first._id, { isDefault: true, updatedAt: now });
        defaultLoc = (await ctx.db.get(first._id))!;
      }
    }

    if (!defaultLoc) return { ok: true, migrated: 0 };

    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    let migrated = 0;
    for (const p of products) {
      const pid = p._id as string;
      const row = await ctx.db
        .query('locationInventory')
        .withIndex('by_user_product_location', (q) =>
          q
            .eq('userId', userId)
            .eq('productId', pid)
            .eq('locationId', defaultLoc!._id)
        )
        .first();
      if (!row) {
        await ctx.db.insert('locationInventory', {
          userId,
          productId: pid,
          locationId: defaultLoc._id,
          quantity: p.stockLevel ?? 0,
          updatedAt: now
        });
        migrated++;
      }
    }

    return { ok: true, migrated };
  }
});

export const createLocation = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    notes: v.optional(v.string()),
    setAsDefault: v.optional(v.boolean())
  },
  async handler(ctx, args) {
    const userId = await requireUser(ctx);
    const now = Date.now();
    const all = await ctx.db
      .query('locations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const maxOrder = all.reduce((m, l) => Math.max(m, l.sortOrder), -1);

    if (args.setAsDefault) {
      for (const l of all) {
        if (l.isDefault)
          await ctx.db.patch(l._id, { isDefault: false, updatedAt: now });
      }
    }

    const isFirst = all.length === 0;
    return await ctx.db.insert('locations', {
      userId,
      name: args.name,
      code: args.code,
      notes: args.notes,
      isActive: true,
      isDefault: isFirst || !!args.setAsDefault,
      sortOrder: maxOrder + 1,
      createdAt: now,
      updatedAt: now
    });
  }
});

export const updateLocation = mutation({
  args: {
    locationId: v.id('locations'),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    notes: v.optional(v.string()),
    sortOrder: v.optional(v.number())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);
    const loc = await ctx.db.get(args.locationId);
    if (!loc || loc.userId !== userId) throw new Error('Location not found');
    await ctx.db.patch(args.locationId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.code !== undefined ? { code: args.code } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      ...(args.sortOrder !== undefined ? { sortOrder: args.sortOrder } : {}),
      updatedAt: Date.now()
    });
  }
});

export const setDefaultLocation = mutation({
  args: { locationId: v.id('locations') },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);
    const loc = await ctx.db.get(args.locationId);
    if (!loc || loc.userId !== userId || !loc.isActive)
      throw new Error('Location not found');

    const all = await ctx.db
      .query('locations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const now = Date.now();
    for (const l of all) {
      await ctx.db.patch(l._id, {
        isDefault: l._id === args.locationId,
        updatedAt: now
      });
    }
  }
});

export const setLocationActive = mutation({
  args: { locationId: v.id('locations'), isActive: v.boolean() },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);
    const loc = await ctx.db.get(args.locationId);
    if (!loc || loc.userId !== userId) throw new Error('Location not found');
    if (!args.isActive && loc.isDefault) {
      throw new Error('Unset default before archiving this location');
    }
    await ctx.db.patch(args.locationId, {
      isActive: args.isActive,
      updatedAt: Date.now()
    });
  }
});

export const applySaleStockDeduction = mutation({
  args: {
    productId: v.id('products'),
    quantityDecremented: v.number(),
    locationId: v.optional(v.id('locations'))
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);
    if (args.quantityDecremented <= 0) throw new Error('Invalid quantity');

    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId || product.isDeleted) {
      throw new Error('Product not found');
    }

    const activeLocs = await getActiveLocations(ctx, userId);
    if (activeLocs.length === 0) {
      const newLevel = (product.stockLevel ?? 0) - args.quantityDecremented;
      if (newLevel < 0) throw new Error('Insufficient stock');
      const reorder = product.reorderLevel ?? 0;
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (newLevel <= 0) stockStatus = 'out_of_stock';
      else if (newLevel <= reorder) stockStatus = 'low_stock';
      await ctx.db.patch(args.productId, {
        stockLevel: newLevel,
        inStock: newLevel > 0,
        stockStatus,
        updatedAt: Date.now()
      });
      return;
    }

    const def = await getDefaultLocationDoc(ctx, userId);
    const targetLocId = args.locationId ?? def?._id;
    if (!targetLocId) {
      const newLevel = (product.stockLevel ?? 0) - args.quantityDecremented;
      if (newLevel < 0) throw new Error('Insufficient stock');
      const reorder = product.reorderLevel ?? 0;
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (newLevel <= 0) stockStatus = 'out_of_stock';
      else if (newLevel <= reorder) stockStatus = 'low_stock';
      await ctx.db.patch(args.productId, {
        stockLevel: newLevel,
        inStock: newLevel > 0,
        stockStatus,
        updatedAt: Date.now()
      });
      return;
    }

    const pid = args.productId as string;
    const allRows = await ctx.db
      .query('locationInventory')
      .withIndex('by_user_product', (q) =>
        q.eq('userId', userId).eq('productId', pid)
      )
      .collect();

    let row = allRows.find((r) => r.locationId === targetLocId);
    if (!row) {
      row = await getOrCreateInventoryRow(ctx, userId, pid, targetLocId);
    }

    const sumRows = allRows.reduce((s, r) => s + r.quantity, 0);
    if (sumRows === 0 && (product.stockLevel ?? 0) > 0) {
      if (row) {
        await ctx.db.patch(row._id, {
          quantity: product.stockLevel ?? 0,
          updatedAt: Date.now()
        });
        row = (await ctx.db.get(row._id))!;
      }
    }

    if (!row || row.quantity < args.quantityDecremented) {
      throw new Error('Insufficient stock at this location');
    }

    await ctx.db.patch(row._id, {
      quantity: row.quantity - args.quantityDecremented,
      updatedAt: Date.now()
    });

    await syncProductStockFromLocationRows(ctx, userId, pid);
  }
});

export const adjustLocationQuantity = mutation({
  args: {
    productId: v.id('products'),
    locationId: v.id('locations'),
    quantity: v.number()
  },
  async handler(ctx, args) {
    const userId = await requireUser(ctx);
    if (args.quantity < 0) throw new Error('Use non-negative quantity');

    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId)
      throw new Error('Product not found');

    const loc = await ctx.db.get(args.locationId);
    if (!loc || loc.userId !== userId) throw new Error('Location not found');

    const pid = args.productId as string;
    let row = await ctx.db
      .query('locationInventory')
      .withIndex('by_user_product_location', (q) =>
        q
          .eq('userId', userId)
          .eq('productId', pid)
          .eq('locationId', args.locationId)
      )
      .first();

    if (!row) {
      await ctx.db.insert('locationInventory', {
        userId,
        productId: pid,
        locationId: args.locationId,
        quantity: args.quantity,
        updatedAt: Date.now()
      });
    } else {
      await ctx.db.patch(row._id, {
        quantity: args.quantity,
        updatedAt: Date.now()
      });
    }

    await syncProductStockFromLocationRows(ctx, userId, pid);
  }
});

async function buildLocationDashboard(
  ctx: { db: any },
  userId: string,
  days: number
) {
  const since = Date.now() - days * 86400000;

  const locs = await getActiveLocations(ctx, userId);
  const products = await ctx.db
    .query('products')
    .withIndex('by_user_and_isDeleted', (q: any) =>
      q.eq('userId', userId).eq('isDeleted', false)
    )
    .collect();

  const invRows = await ctx.db
    .query('locationInventory')
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .collect();

  const productById = new Map(products.map((p: any) => [p._id as string, p]));

  const metrics = locs.map((loc: any) => {
    const rows = invRows.filter((r: any) => r.locationId === loc._id);
    let units = 0;
    let skus = 0;
    let value = 0;
    for (const r of rows) {
      if (r.quantity <= 0) continue;
      skus++;
      units += r.quantity;
      const p = productById.get(r.productId) as any;
      const cost = p?.purchasePrice ? parseFloat(String(p.purchasePrice)) : 0;
      if (!Number.isNaN(cost)) value += r.quantity * cost;
    }
    return {
      locationId: loc._id,
      name: loc.name,
      code: loc.code,
      skuCount: skus,
      totalUnits: units,
      inventoryValue: Math.round(value * 100) / 100
    };
  });

  const sales = await ctx.db
    .query('sales')
    .withIndex('by_user_and_isDeleted', (q: any) =>
      q.eq('userId', userId).eq('isDeleted', false)
    )
    .collect();

  const recent = sales.filter((s: any) => s.soldAt >= since);
  const revenueByLocation: Record<string, number> = {};
  let unassignedRevenue = 0;
  for (const s of recent) {
    const amt = s.totalAmount ?? 0;
    const lid = s.locationId as string | undefined;
    if (lid) revenueByLocation[lid] = (revenueByLocation[lid] ?? 0) + amt;
    else unassignedRevenue += amt;
  }

  const salesSlice = locs.map((loc: any) => ({
    locationId: loc._id,
    name: loc.name,
    revenue:
      Math.round((revenueByLocation[loc._id as string] ?? 0) * 100) / 100,
    orders: recent.filter((s: any) => s.locationId === loc._id).length
  }));

  const companyUnits = metrics.reduce(
    (s: number, m: any) => s + m.totalUnits,
    0
  );
  const companyValue = metrics.reduce(
    (s: number, m: any) => s + m.inventoryValue,
    0
  );

  return {
    windowDays: days,
    locations: metrics,
    salesByLocation: salesSlice,
    unassignedRevenue: Math.round(unassignedRevenue * 100) / 100,
    company: {
      locationCount: locs.length,
      totalSkuLocations: metrics.reduce(
        (s: number, m: any) => s + m.skuCount,
        0
      ),
      totalUnits: companyUnits,
      inventoryValue: Math.round(companyValue * 100) / 100
    }
  };
}

export const getLocationDashboardMetrics = query({
  args: { days: v.optional(v.number()) },
  async handler(ctx, args) {
    const userId = await requireUser(ctx);
    const days = args.days ?? 30;
    return await buildLocationDashboard(ctx, userId, days);
  }
});

export const getInventorySyncOverview = query({
  args: {},
  async handler(ctx) {
    const userId = await requireUser(ctx);
    const locs = await getActiveLocations(ctx, userId);
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const invRows = await ctx.db
      .query('locationInventory')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const mismatches: {
      productId: string;
      name: string;
      ledger: number;
      sumLocations: number;
    }[] = [];

    for (const p of products) {
      const pid = p._id as string;
      const rows = invRows.filter((r) => r.productId === pid);
      const sumLoc = rows.reduce((s, r) => s + r.quantity, 0);
      const ledger = p.stockLevel ?? 0;
      if (rows.length > 0 && sumLoc !== ledger) {
        mismatches.push({
          productId: pid,
          name: p.name,
          ledger,
          sumLocations: sumLoc
        });
      }
    }

    return {
      locations: locs.map((l: any) => ({
        id: l._id,
        name: l.name,
        isDefault: l.isDefault
      })),
      productCount: products.length,
      trackedRows: invRows.length,
      mismatches: mismatches.slice(0, 50)
    };
  }
});

export const compareLocations = query({
  args: { days: v.optional(v.number()) },
  async handler(ctx, args) {
    const userId = await requireUser(ctx);
    const days = args.days ?? 30;
    const dash = await buildLocationDashboard(ctx, userId, days);
    const byValue = [...dash.locations].sort(
      (a, b) => b.inventoryValue - a.inventoryValue
    );
    return {
      compare: byValue.map((m, i) => ({ rank: i + 1, ...m })),
      salesCompare: [...dash.salesByLocation].sort(
        (a, b) => b.revenue - a.revenue
      )
    };
  }
});

export const getProductLocationBreakdown = query({
  args: { productId: v.id('products') },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);
    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId) return null;

    const rows = await ctx.db
      .query('locationInventory')
      .withIndex('by_user_product', (q) =>
        q.eq('userId', userId).eq('productId', args.productId as string)
      )
      .collect();

    const locs = await ctx.db
      .query('locations')
      .withIndex('by_user', (q: any) => q.eq('userId', userId))
      .collect();

    const locMap = new Map(locs.map((l: any) => [l._id as string, l.name]));
    return {
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        ledger: product.stockLevel ?? 0
      },
      rows: rows.map((r: any) => ({
        locationId: r.locationId,
        locationName: locMap.get(r.locationId as string) ?? '—',
        quantity: r.quantity
      }))
    };
  }
});

export const getLocalSalesReport = query({
  args: {
    locationId: v.optional(v.id('locations')),
    days: v.optional(v.number())
  },
  async handler(ctx, args) {
    const userId = await requireUser(ctx);
    const days = args.days ?? 30;
    const since = Date.now() - days * 86400000;

    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const filtered = sales.filter((s) => s.soldAt >= since);
    const scoped = args.locationId
      ? filtered.filter((s) => s.locationId === args.locationId)
      : filtered;

    const revenue = scoped.reduce((s, x) => s + (x.totalAmount ?? 0), 0);
    const units = scoped.reduce((s, x) => s + (x.quantitySold ?? 0), 0);

    return {
      mode: args.locationId ? 'local' : 'consolidated',
      days,
      orders: scoped.length,
      revenue: Math.round(revenue * 100) / 100,
      units
    };
  }
});

export const getInventoryMatrix = query({
  args: { limit: v.optional(v.number()) },
  async handler(ctx, args) {
    const userId = await requireUser(ctx);
    const limit = Math.min(args.limit ?? 120, 400);

    const locs = (await getActiveLocations(ctx, userId)).sort(
      (a: any, b: any) => a.sortOrder - b.sortOrder
    );
    const products = (
      await ctx.db
        .query('products')
        .withIndex('by_user_and_isDeleted', (q: any) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .collect()
    ).slice(0, limit);

    const invRows = await ctx.db
      .query('locationInventory')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const rows = products.map((p: any) => {
      const pid = p._id as string;
      const cells: Record<string, number> = {};
      for (const l of locs) {
        const r = invRows.find(
          (x: any) => x.productId === pid && x.locationId === l._id
        );
        cells[l._id as string] = r?.quantity ?? 0;
      }
      const sum = Object.values(cells).reduce(
        (a: number, b: number) => a + b,
        0
      );
      return {
        productId: pid,
        name: p.name,
        sku: p.sku,
        cells,
        sumLocations: sum,
        ledger: p.stockLevel ?? 0
      };
    });

    return {
      locations: locs.map((l: any) => ({ id: l._id, name: l.name })),
      rows
    };
  }
});
