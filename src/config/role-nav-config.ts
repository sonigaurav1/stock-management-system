/**
 * Enterprise Role-Based Navigation Configuration
 * Provides granular permission-to-menu mapping for each role
 *
 * This config defines which navigation items each role can access
 * based on the PERMISSIONS system from convex/lib/permissions.ts
 */

import { NavItem } from '@/types';

/**
 * Role hierarchy - higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 100,
  manager: 75,
  staff: 50,
  viewer: 25,
  guest: 0
};

/**
 * Menu item to permission mapping
 * Maps each navigation item and its sub-items to required permissions
 * Note: Uses string values to allow any permission from the permissions system
 */
export const MENU_PERMISSIONS: Record<
  string,
  {
    main?: string;
    subItems?: Record<string, string>;
  }
> = {
  // Dashboard - accessible by all authenticated users
  Dashboard: {
    main: 'view_inventory'
  },

  // Inventory section
  Inventory: {
    main: 'view_inventory',
    subItems: {
      Products: 'view_inventory',
      Categories: 'view_inventory',
      'Stock & Restock': 'manage_stock',
      Warehouses: 'view_inventory',
      'Inventory Audit': 'view_inventory',
      'Inventory Forecast': 'view_reports'
    }
  },

  // Purchasing section
  Purchasing: {
    main: 'view_inventory',
    subItems: {
      Suppliers: 'manage_suppliers'
    }
  },

  // Finance section
  Finance: {
    main: 'view_ledger',
    subItems: {
      Expenses: 'manage_expenses',
      Accounting: 'view_ledger',
      Invoices: 'create_transaction',
      Billing: 'manage_settings'
    }
  },

  // Reports section
  Reports: {
    main: 'view_reports',
    subItems: {
      'Sales Report': 'view_reports',
      'Stock Report': 'view_reports',
      'Financial Report': 'view_financial_reports'
    }
  },

  // Communication section
  Communication: {
    main: 'view_inventory',
    subItems: {
      Messages: 'view_inventory',
      Tasks: 'view_inventory',
      Notifications: 'view_inventory'
    }
  },

  // Settings section
  Settings: {
    main: 'manage_settings',
    subItems: {
      Overview: 'manage_settings',
      'User Preferences': 'view_inventory',
      Appearance: 'view_inventory',
      Display: 'view_inventory',
      Notifications: 'manage_settings',
      Organization: 'manage_organization',
      'Users & Permissions': 'manage_users',
      Integrations: 'manage_settings',
      'Security & Compliance': 'view_compliance',
      'Billing & Subscription': 'manage_settings',
      'API & Webhooks': 'manage_settings',
      Automation: 'manage_settings',
      'Import / Export': 'export_data'
    }
  },

  // Help & Support - accessible by all
  'Help & Support': {
    main: 'view_inventory',
    subItems: {
      'Help Center': 'view_inventory',
      'API Documentation': 'view_inventory'
    }
  }
};

/**
 * Role-specific navigation visibility
 * Defines which sections each role can see
 */
export const ROLE_NAV_CONFIG: Record<
  string,
  {
    visibleSections: string[];
    restrictedSections: string[];
    canSeeSubItems: boolean;
  }
> = {
  owner: {
    visibleSections: [
      'Dashboard',
      'Inventory',
      'Purchasing',
      'Finance',
      'Reports',
      'Communication',
      'Settings',
      'Help & Support'
    ],
    restrictedSections: [],
    canSeeSubItems: true
  },
  manager: {
    visibleSections: [
      'Dashboard',
      'Inventory',
      'Purchasing',
      'Finance',
      'Reports',
      'Communication',
      'Settings',
      'Help & Support'
    ],
    restrictedSections: ['Settings'],
    canSeeSubItems: true
  },
  staff: {
    visibleSections: [
      'Inventory',
      'Purchasing',
      'Communication',
      'Help & Support'
    ],
    restrictedSections: ['Finance', 'Reports', 'Settings', 'Dashboard'],
    canSeeSubItems: true
  },
  viewer: {
    visibleSections: ['Dashboard', 'Help & Support'],
    restrictedSections: [
      'Inventory',
      'Purchasing',
      'Finance',
      'Reports',
      'Communication',
      'Settings'
    ],
    canSeeSubItems: false
  }
};

/**
 * Role-based quick actions shown in user dropdown
 */
export const ROLE_QUICK_ACTIONS: Record<
  string,
  {
    label: string;
    href: string;
    icon: string;
    requiresPermission?: string;
  }[]
> = {
  owner: [
    {
      label: 'Manage Team',
      href: '/settings/users',
      icon: 'users',
      requiresPermission: 'manage_users'
    },
    {
      label: 'Organization Settings',
      href: '/settings/organization',
      icon: 'building',
      requiresPermission: 'manage_organization'
    },
    {
      label: 'Billing & Subscription',
      href: '/settings/billing',
      icon: 'creditCard',
      requiresPermission: 'manage_settings'
    },
    {
      label: 'Audit Logs',
      href: '/settings/security',
      icon: 'shield',
      requiresPermission: 'view_audit_logs'
    }
  ],
  manager: [
    {
      label: 'Manage Users',
      href: '/settings/users',
      icon: 'users',
      requiresPermission: 'manage_users'
    },
    {
      label: 'Team Reports',
      href: '/reports',
      icon: 'barChart3',
      requiresPermission: 'view_reports'
    },
    {
      label: 'Finance Overview',
      href: '/finance',
      icon: 'wallet',
      requiresPermission: 'view_ledger'
    }
  ],
  staff: [
    { label: 'My Tasks', href: '/communication/tasks', icon: 'checkSquare' },
    { label: 'Inventory', href: '/inventory', icon: 'packagePlus' }
  ],
  viewer: [{ label: 'Help Center', href: '/help-center', icon: 'help' }]
};

/**
 * Role display configuration for UI
 */
export const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  owner: {
    label: 'Owner',
    description: 'Full access to all features and settings',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: 'crown'
  },
  manager: {
    label: 'Manager',
    description: 'Can manage team and view reports',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: 'shield'
  },
  staff: {
    label: 'Staff',
    description: 'Can view and manage inventory',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: 'user'
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to dashboard',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: 'eye'
  }
};

/**
 * Filter navigation items based on user role and permissions
 */
export function filterNavByRole(
  items: NavItem[],
  role: string | null,
  can: (permission: string) => boolean
): NavItem[] {
  const normalizedRole = role?.toLowerCase() || 'viewer';
  const config = ROLE_NAV_CONFIG[normalizedRole] || ROLE_NAV_CONFIG.viewer;

  return items
    .map((item) => {
      // Skip if section is restricted for this role
      if (config.restrictedSections.includes(item.title)) {
        return null;
      }

      // Skip if section is not in visible list
      if (
        !config.visibleSections.includes(item.title) &&
        config.visibleSections.length > 0
      ) {
        return null;
      }

      // Get permission requirement for this item
      const permConfig = MENU_PERMISSIONS[item.title];
      if (permConfig?.main && !can(permConfig.main)) {
        return null;
      }

      // Filter sub-items based on permissions
      if (item.items && item.items.length > 0 && config.canSeeSubItems) {
        const filteredSubItems = item.items.filter((subItem) => {
          // If no sub-item specific permission, allow
          if (!permConfig?.subItems) return true;

          const subPerm = permConfig.subItems[subItem.title];
          if (!subPerm) return true;

          return can(subPerm);
        });

        // Don't show parent if all sub-items are hidden
        if (filteredSubItems.length === 0 && !config.canSeeSubItems) {
          return null;
        }

        return { ...item, items: filteredSubItems };
      }

      return item;
    })
    .filter((item): item is NavItem => item !== null);
}

/**
 * Get quick actions for current role
 */
export function getQuickActions(
  role: string | null,
  can: (permission: string) => boolean
): { label: string; href: string; icon: string }[] {
  const normalizedRole = role?.toLowerCase() || 'viewer';
  const actions = ROLE_QUICK_ACTIONS[normalizedRole] || [];

  return actions
    .filter((action) => {
      if (!action.requiresPermission) return true;
      return can(action.requiresPermission);
    })
    .map(({ label, href, icon }) => ({ label, href, icon }));
}

/**
 * Get role display info
 */
export function getRoleDisplayInfo(role: string | null): {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  const normalizedRole = role?.toLowerCase() || 'viewer';
  const config = ROLE_CONFIG[normalizedRole] || ROLE_CONFIG.viewer;

  return {
    label: config.label,
    description: config.description,
    color: config.color,
    bgColor: config.bgColor,
    icon: config.icon
  };
}

/**
 * Check if user can access a specific section
 */
export function canAccessSection(
  sectionTitle: string,
  role: string | null,
  can: (permission: string) => boolean
): boolean {
  const normalizedRole = role?.toLowerCase() || 'viewer';
  const config = ROLE_NAV_CONFIG[normalizedRole] || ROLE_NAV_CONFIG.viewer;

  // Check if restricted
  if (config.restrictedSections.includes(sectionTitle)) {
    return false;
  }

  // Check permission
  const permConfig = MENU_PERMISSIONS[sectionTitle];
  if (permConfig?.main && !can(permConfig.main)) {
    return false;
  }

  return true;
}
