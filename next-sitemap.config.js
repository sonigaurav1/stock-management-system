/** next-sitemap.config.js */
const dynamicSlugs = [
  // Auth
  '/sign-in',
  // '/sign-in/demo',
  '/sign-up',
  // '/sign-up/demo',
  '/verify',
  '/company-details',

  // main
  // Billing
  '/billing',
  '/billing/creditors/payments',

  // Dashboard
  '/dashboard/customers',
  '/dashboard/invoices',
  '/dashboard/overview',
  '/dashboard/payments',
  '/inventory/products',
  '/inventory/categories',
  '/procurement/suppliers',
  '/dashboard/sales',
  '/dashboard/transactions',

  // Help Center
  '/help-center',
  '/help-center/article',
  '/help-center/category',

  // Ledger
  '/ledger',
  '/ledger/entries',
  '/ledger/entry/view',

  // Organization (moved to settings)
  // '/organization', - REMOVED (now /settings/organization)

  // Sales (was /restock - now properly named)
  '/sales',

  // Inventory Management
  '/inventory/warehouses',
  '/inventory/audit',
  '/inventory/forecast',

  // Settings
  '/settings',
  '/settings/account',
  '/settings/appearance',
  '/settings/display',
  '/settings/notifications',
  '/settings/profile',
  '/settings/company',
  '/settings/billing',
  '/settings/integrations',
  // '/settings/integration/:integrationId', // Example of dynamic route
  // '/settings/integration/:integrationId/edit', // Example of dynamic route

  // Products
  '/products',
  '/products/add-product',
  // Orders
  '/orders',
  // Customers
  '/customers',
  // Analytics
  '/analytics/sales',
  '/analytics/customers',
  '/analytics/products',
  // Coupons
  '/coupons',
  '/coupons/create-coupon',
  // Categories
  '/categories',
  '/categories/add-category',
  // Brands
  '/brands',
  '/brands/add-brand',
  // Tags
  '/tags',
  '/tags/add-tag',
  // Reviews
  '/reviews',
  // Shipping
  '/shipping',
  '/shipping/add-shipping-method',
  // Payments
  '/payments',
  // Reports
  '/reports',
  // Notifications
  '/notifications',
  // User Management
  '/users',
  '/users/add-user',
  // Developer Admin
  // '/admin',
  // '/role-admin',
  // Marketing
  '/landing-page'
  // Main (add more as needed)
  // Add more dynamic/static routes here as your app grows
];

module.exports = {
  siteUrl: 'https://digitaldukan.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  outDir: './public',
  // Add all static and dynamic routes
  additionalPaths: async (config) => {
    return dynamicSlugs.map((slug) => ({
      loc: `${config.siteUrl}${slug}`,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString()
    }));
  }
};
