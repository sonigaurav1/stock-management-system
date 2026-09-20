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
  // 🌐 ADMIN (Roles: Admin/Developer)
  // ============================================
  {
    title: 'Admin',
    url: '/admin',
    icon: 'building',
    isActive: false,
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: 'dashboard'
        // website management, all companies, system health
      }
    ]
  }
];

export const BUSINESS_TYPES = [
  { value: 'retailer', label: 'Retailer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'e_commerce', label: 'E-Commerce' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' }
];

export const COUNTRIES = [
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AO', label: 'Angola' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BN', label: 'Brunei' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'CV', label: 'Cape Verde' },
  { value: 'CF', label: 'Central African Republic' },
  { value: 'TD', label: 'Chad' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros' },
  { value: 'CG', label: 'Congo' },
  { value: 'CD', label: 'Congo (Democratic Republic)' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estonia' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GR', label: 'Greece' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'LA', label: 'Laos' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'MX', label: 'Mexico' },
  { value: 'MD', label: 'Moldova' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KP', label: 'North Korea' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PS', label: 'Palestine' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SO', label: 'Somalia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SY', label: 'Syria' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'YE', label: 'Yemen' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' }
];

export const PROJECT_NAME = 'Invento'; // Used in the app title, meta tags, and branding
