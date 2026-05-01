/**
 * Convex Schema Helper Utilities
 *
 * Provides reusable functions to reduce redundancy and ensure consistency
 * across schema definitions. Eliminates boilerplate for common patterns.
 *
 * Usage:
 *   const myTable = defineTable({
 *     name: v.string(),
 *     ...withUserTenancy(),
 *     ...withSoftDelete(),
 *     ...withTimestamps(),
 *   })
 */

import { v } from 'convex/values';

/**
 * Add userId-based tenancy and primary index
 *
 * Includes:
 * - userId: string (tenant key)
 * - by_user index (for user-scoped queries)
 *
 * @returns Object to spread into defineTable()
 */
export const withUserTenancy = () =>
  ({
    userId: v.string()
  }) as const;

/**
 * Add soft-delete fields and cleanup index
 *
 * Includes:
 * - isDeleted: boolean (default false = active, true = deleted)
 * - by_user_and_isDeleted index (for active records only queries)
 *
 * @returns Object to spread into defineTable()
 */
export const withSoftDelete = () =>
  ({
    isDeleted: v.boolean()
  }) as const;

/**
 * Add standard audit timestamps
 *
 * Includes:
 * - createdAt: number (immutable, set once)
 * - updatedAt: optional<number> (updated on every change)
 *
 * @returns Object to spread into defineTable()
 */
export const withTimestamps = () =>
  ({
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }) as const;

/**
 * Add standard audit fields: tenancy + soft-delete + timestamps
 *
 * Most tables use all three. Shorthand for:
 *   ...withUserTenancy()
 *   ...withSoftDelete()
 *   ...withTimestamps()
 *
 * @returns Object to spread into defineTable()
 */
export const withStandardAudit = () =>
  ({
    ...withUserTenancy(),
    ...withSoftDelete(),
    ...withTimestamps()
  }) as const;

/**
 * Add location support for multi-site deployments
 *
 * Includes:
 * - locationId: optional<Id<'locations'>> (site reference)
 *
 * Use when table supports multi-location operations (inventory, sales, etc.)
 *
 * @returns Object to spread into defineTable()
 */
export const withLocationSupport = () =>
  ({
    locationId: v.optional(v.id('locations'))
  }) as const;

/**
 * Build composite index names and field arrays
 *
 * Examples:
 *   indexFor('user', ['userId']) → 'by_user'
 *   indexFor('user_and_status', ['userId', 'status']) → 'by_user_and_status'
 *
 * @param name Index suffix after 'by_'
 * @param fields Array of field names to index
 * @returns Object with 'name' and 'fields' for reference
 */
export const indexFor = (name: string, fields: string[]) => ({
  name: `by_${name}`,
  fields
});

/**
 * Standard index patterns used across schema
 *
 * Pre-defined indexes for common queries:
 * - User scoped: index by userId
 * - User + soft-delete: index by userId + isDeleted (most common)
 * - User + status: index by userId + status
 *
 * Usage in table definition:
 *   .index('by_user', ['userId'])
 *   .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
 */
export const STANDARD_INDEXES = {
  BY_USER: indexFor('user', ['userId']),
  BY_USER_AND_DELETED: indexFor('user_and_isDeleted', ['userId', 'isDeleted']),
  BY_USER_AND_STATUS: indexFor('user_and_status', ['userId', 'status']),
  BY_USER_AND_TYPE: indexFor('user_and_type', ['userId', 'type']),
  BY_USER_AND_CATEGORY: indexFor('user_and_category', ['userId', 'categoryId'])
} as const;

/**
 * Event/Audit log entry shape
 *
 * Used in unified auditLog and processLog tables
 */
export const auditLogEntry = v.object({
  action: v.string(), // "create", "update", "delete"
  entityType: v.string(), // "product", "sale", "expense"
  entityId: v.string(), // Record ID
  changes: v.optional(v.any()), // What changed: { field: { old, new } }
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string())
});

/**
 * Approval workflow entry
 *
 * Used in expense approvals, price change requests, etc.
 */
export const approvalStep = v.object({
  approverUserId: v.string(),
  order: v.number(), // Sequence (1, 2, 3...)
  status: v.string(), // "pending", "approved", "rejected"
  approvalDate: v.optional(v.number()),
  comments: v.optional(v.string())
});

/**
 * Generic filter for reports/exports
 *
 * Used in customReports, scheduledReports, etc.
 */
export const reportFilter = v.object({
  field: v.string(),
  operator: v.string(), // "equals", "contains", "gt", "lt", "between", "in"
  value: v.any()
});

/**
 * Sort specification for reports/queries
 *
 * Used in customReports, reportExecutions, etc.
 */
export const sortSpec = v.object({
  field: v.string(),
  direction: v.string() // "asc", "desc"
});

/**
 * Extracted data from OCR (receipts, invoices)
 *
 * Used in expenseReceipts, invoices, etc.
 */
export const ocrData = v.object({
  vendor: v.optional(v.string()),
  date: v.optional(v.string()),
  amount: v.optional(v.number()),
  description: v.optional(v.string()),
  confidence: v.optional(v.number()) // 0-100
});
