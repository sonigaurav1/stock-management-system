import { v } from 'convex/values';

/**
 * Schema validation constants for enterprise-grade security
 * Prevents invalid values that could break business logic
 */

// Status field constants
export const ACCOUNT_STATUS_VALUES = [
  'pending',
  'approved',
  'rejected',
  'suspended',
  'active',
  'archived',
  'deleted'
] as const;

export const ORGANIZATION_STATUS_VALUES = [
  'active',
  'archived',
  'deleted'
] as const;

export const EXPENSE_STATUS_VALUES = [
  'pending',
  'approved',
  'rejected'
] as const;

export const PAYMENT_STATUS_VALUES = [
  'paid',
  'unpaid',
  'partially_paid',
  'refunded',
  'void'
] as const;

export const TASK_STATUS_VALUES = [
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
] as const;

export const SYNC_STATUS_VALUES = [
  'success',
  'failed',
  'in_progress',
  'pending'
] as const;

export const PROCESSING_STATUS_VALUES = [
  'processing',
  'completed',
  'failed',
  'queued'
] as const;

// Role constants
export const ROLE_VALUES = ['owner', 'manager', 'staff', 'viewer'] as const;

// Business type constants
export const BUSINESS_TYPE_VALUES = [
  'retailer',
  'wholesaler',
  'manufacturer',
  'distributor',
  'service_provider',
  'e_commerce',
  'corporate',
  'nonprofit',
  'other'
] as const;

// Unit constants for inventory
export const UNIT_VALUES = [
  'pcs',
  'kg',
  'liter',
  'meter',
  'box',
  'carton',
  'bottle',
  'bag',
  'pair',
  'set',
  'dozen'
] as const;

// Frequency constants for recurring items
export const FREQUENCY_VALUES = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
] as const;

// Company type constants
export const COMPANY_TYPE_VALUES = [
  'company',
  'firm',
  'proprietorship',
  'partnership',
  'corporation'
] as const;

// Helper functions to create union types
export const createStatusUnion = (values: readonly string[]) => {
  return values.reduce(
    (acc, value) => {
      acc[value] = v.literal(value);
      return acc;
    },
    {} as Record<string, any>
  );
};
