import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
// Navigation is organized into logical sections for better UX and scalability
export const navItems: NavItem[] = [
  // ============================================
  // 📊 ANALYTICS & OVERVIEW (Quick Insights)
  // ============================================
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // High-level business metrics and KPIs
  },

  // ============================================
  // 📦 INVENTORY MANAGEMENT (Core Operations)
  // ============================================
  {
    title: 'Inventory',
    url: '/inventory',
    icon: 'packagePlus',
    isActive: false,
    shortcut: ['i', 'i'],
    items: [
      {
        title: 'Products',
        url: '/inventory/products',
        icon: 'product'
        // Manage all products: create, edit, delete, track quantities
      },
      {
        title: 'Categories',
        url: '/inventory/categories',
        icon: 'category'
        // Organize products into logical groups for easier management
      },
      {
        title: 'Sales',
        url: '/sales',
        icon: 'refresh'
        // Update stock levels, restock items, manage warehouses
      },
      {
        title: 'Warehouses',
        url: '/inventory/warehouses',
        icon: 'locations'
        // Multi-site inventory, transfers, location dashboards and reporting
      },
      {
        title: 'Inventory Audit',
        url: '/inventory/audit',
        icon: 'search'
        // Verify physical stock vs system records, identify discrepancies
      },
      {
        title: 'Inventory Forecast',
        url: '/inventory/forecast',
        icon: 'trendingUp'
        // Predict future stock needs, prevent stockouts
      }
    ]
  },

  // ============================================
  // 🤝 SUPPLIER & PURCHASING
  // ============================================
  {
    title: 'Purchasing',
    url: '/procurement',
    icon: 'briefcase',
    isActive: false,
    items: [
      {
        title: 'Suppliers',
        url: '/procurement/suppliers',
        icon: 'supplier'
        // Source for products, track performance metrics, vendor profiles, ratings, contact info, payment terms
      }
    ]
  },

  // ============================================
  // 💰 FINANCIAL & ACCOUNTING (Money Flow)
  // ============================================
  {
    title: 'Finance',
    url: '/finance',
    icon: 'creditCard',
    isActive: false,
    shortcut: ['f', 'f'],
    items: [
      {
        title: 'Expenses',
        url: '/expenses',
        icon: 'wallet'
        // Track and manage business expenses, categorize spending
      },
      {
        title: 'Accounting',
        url: '/ledger',
        icon: 'ledger'
        // Complete accounting records with receipt attachments
      },
      {
        title: 'Invoices',
        url: '/invoice',
        icon: 'productBilling'
        // View, manage, and generate sales invoices
      },
      {
        title: 'Billing',
        url: '/billing',
        icon: 'productBilling'
        // Subscription plans, recurring charges, payment tracking
      }
    ]
  },

  // ============================================
  // 📈 REPORTS & INSIGHTS (Business Intelligence)
  // ============================================
  {
    title: 'Reports',
    url: '/reports',
    icon: 'barChart3',
    isActive: false,
    items: [
      {
        title: 'Sales Report',
        url: '/reports/sales',
        icon: 'trendingUp'
        // Revenue trends, top products, customer insights
      },
      {
        title: 'Stock Report',
        url: '/reports/stock',
        icon: 'warehouse'
        // Stock valuation, inventory aging, dead stock analysis
      },
      {
        title: 'Financial Report',
        url: '/reports/financial',
        icon: 'barChart3'
        // P&L statements, cash flow, profitability analysis
      }
    ]
  },

  // ============================================
  // 💬 COMMUNICATION HUB (Messaging & Tasks)
  // ============================================
  {
    title: 'Communication',
    url: '/communication',
    icon: 'mail',
    isActive: false,
    shortcut: ['c', 'c'],
    items: [
      {
        title: 'Messages',
        url: '/communication/inbox',
        icon: 'mail'
        // In-app messaging, team communication, message threads
      },
      {
        title: 'Tasks',
        url: '/communication/tasks',
        icon: 'checkSquare'
        // Task assignment, status tracking, task comments
      },
      {
        title: 'Notifications',
        url: '/communication/notifications',
        icon: 'bell'
        // Notification preferences, channels, quiet hours, alerts
      }
    ]
  },

  // ============================================
  // ⚙️ CONFIGURATION & SYSTEM (Settings)
  // ============================================
  {
    title: 'Settings',
    url: '/settings',
    icon: 'settings',
    isActive: false,
    shortcut: ['s', 's'],
    items: [
      {
        title: 'Overview',
        url: '/settings',
        icon: 'settings'
        // Settings dashboard and overview
      },
      {
        title: 'User Preferences',
        url: '/settings/profile',
        icon: 'user'
        // User profile, personal details, password
      },
      {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: 'monitor'
        // Theme, language, timezone, display settings
      },
      {
        title: 'Display',
        url: '/settings/display',
        icon: 'trendingUp'
        // Dashboard layout, density, UI options
      },
      {
        title: 'Notifications',
        url: '/settings/notifications',
        icon: 'bell'
        // Email alerts, SMS, in-app notifications
      },
      {
        title: 'Organization',
        url: '/settings/organization',
        icon: 'building'
        // Company details, tax ID, GST, business registration
      },
      {
        title: 'Users & Permissions',
        url: '/settings/users',
        icon: 'shield'
        // Team management, roles, RBAC, access levels
      },
      {
        title: 'Integrations',
        url: '/settings/integrations',
        icon: 'plug'
        // Accounting software, payment gateways, e-commerce
      },
      {
        title: 'Security & Compliance',
        url: '/settings/security',
        icon: 'lock'
        // 2FA, audit logs, data retention, SSO, API security
      },
      {
        title: 'Billing & Subscription',
        url: '/settings/billing',
        icon: 'creditCard'
        // Plans, usage, invoices, payment methods
      },
      {
        title: 'API',
        url: '/settings/api',
        icon: 'key'
        // API keys, rate limits
      },
      {
        title: 'Import / Export',
        url: '/settings/data',
        icon: 'download'
        // Backup, restore, and data management
      }
    ]
  },

  // ============================================
  // 📚 SUPPORT & RESOURCES (Help)
  // ============================================
  {
    title: 'Help & Support',
    url: '/help-center',
    icon: 'help',
    isActive: false,
    shortcut: ['h', 'h'],
    items: [
      {
        title: 'Help Center',
        url: '/help-center',
        icon: 'help'
        // Documentation, tutorials, FAQs
      },
      {
        title: 'API Documentation',
        url: '/api-docs',
        icon: 'book'
        // Developer resources, API guides
      }
    ]
  },

  // ============================================
  // 👨‍💼 ADMIN & MANAGEMENT (Roles: Owner/Manager)
  // ============================================
  {
    title: 'Admin',
    url: '/admin',
    icon: 'shield',
    isActive: false,
    shortcut: ['a', 'a'],
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: 'dashboard'
        // Organization admin dashboard, team management
      }
    ]
  },

  // ============================================
  // 🌐 PLATFORM ADMIN (Roles: Super-Admin/Developer)
  // ============================================
  {
    title: 'Platform Admin',
    url: '/platform',
    icon: 'building',
    isActive: false,
    items: [
      {
        title: 'Dashboard',
        url: '/platform',
        icon: 'dashboard'
        // Platform management, all companies, system health
      }
    ]
  }
];

export const projectName = 'Invento'; // Used in the app title, meta tags, and branding
