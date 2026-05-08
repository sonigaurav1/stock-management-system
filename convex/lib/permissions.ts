/**
 * Permission catalog for enterprise RBAC system
 * All permission strings must be defined here to avoid duplication
 */

export const PERMISSIONS = {
  // Inventory & Products
  VIEW_INVENTORY: 'view_inventory',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_STOCK: 'manage_stock',

  // Transactions & Sales
  CREATE_TRANSACTION: 'create_transaction',
  EDIT_TRANSACTION: 'edit_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  APPROVE_TRANSACTION: 'approve_transaction',

  // Reports & Export
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  VIEW_ANALYTICS: 'view_analytics',

  // Finance & Ledger
  VIEW_LEDGER: 'view_ledger',
  MANAGE_EXPENSES: 'manage_expenses',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',

  // Suppliers
  MANAGE_SUPPLIERS: 'manage_suppliers',

  // Users & Access Control
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',

  // Organization & Company
  VIEW_ORGANIZATION: 'view_organization',
  MANAGE_ORGANIZATION: 'manage_organization',

  // Audit & Compliance
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_COMPLIANCE: 'view_compliance'
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Preset roles with predefined permissions
 * Business owners can use these as templates or create custom roles
 */
export const ROLE_PRESETS: Record<string, (typeof PERMISSIONS)[Permission][]> =
  {
    owner: [
      // Full access
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.CREATE_PRODUCT,
      PERMISSIONS.EDIT_PRODUCT,
      PERMISSIONS.DELETE_PRODUCT,
      PERMISSIONS.MANAGE_STOCK,
      PERMISSIONS.CREATE_TRANSACTION,
      PERMISSIONS.EDIT_TRANSACTION,
      PERMISSIONS.DELETE_TRANSACTION,
      PERMISSIONS.APPROVE_TRANSACTION,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.EXPORT_DATA,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_LEDGER,
      PERMISSIONS.MANAGE_EXPENSES,
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.MANAGE_SUPPLIERS,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_ROLES,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.VIEW_ORGANIZATION,
      PERMISSIONS.MANAGE_ORGANIZATION,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.VIEW_COMPLIANCE
    ],

    manager: [
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.CREATE_PRODUCT,
      PERMISSIONS.EDIT_PRODUCT,
      PERMISSIONS.MANAGE_STOCK,
      PERMISSIONS.CREATE_TRANSACTION,
      PERMISSIONS.EDIT_TRANSACTION,
      PERMISSIONS.APPROVE_TRANSACTION,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.EXPORT_DATA,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_LEDGER,
      PERMISSIONS.MANAGE_EXPENSES,
      PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      PERMISSIONS.MANAGE_SUPPLIERS,
      PERMISSIONS.VIEW_ORGANIZATION,
      PERMISSIONS.VIEW_AUDIT_LOGS
    ],

    staff: [
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.CREATE_TRANSACTION,
      PERMISSIONS.EDIT_TRANSACTION,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_ORGANIZATION
    ],

    viewer: [
      PERMISSIONS.VIEW_INVENTORY,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.VIEW_ORGANIZATION
    ]
  };

/**
 * Get permissions for a preset role
 */
export function getPresetPermissions(roleName: string): string[] {
  return ROLE_PRESETS[roleName.toLowerCase()] ?? [];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string
): boolean {
  return permissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the required permissions
 */
export function hasAnyPermission(
  permissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((p) => permissions.includes(p));
}

/**
 * Check if a user has all required permissions
 */
export function hasAllPermissions(
  permissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((p) => permissions.includes(p));
}
