// Types and definitions for the intelligent dashboard system
export type BusinessType =
  | 'retailer'
  | 'wholesaler'
  | 'distributor'
  | 'manufacturer'
  | 'service_provider';

export type WidgetType =
  | 'revenue_summary'
  | 'sales_count'
  | 'customer_count'
  | 'top_products'
  | 'inventory_health'
  | 'cash_flow'
  | 'profit_margin'
  | 'sales_trend'
  | 'inventory_turnover'
  | 'supplier_performance'
  | 'payment_status'
  | 'reorder_alerts'
  | 'profitability'
  | 'budget_status'
  | 'expense_trend'
  | 'customer_insights'
  // STEP 1.1: Cash Ledger Widget
  | 'cash_ledger'
  // STEP 1.3: Receivables Aging Widget
  | 'receivables_aging'
  // STEP 1.4: Top Vendors by Spend
  | 'top_vendors';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: number;
  size: 'small' | 'medium' | 'large'; // Grid size for customizer
  isVisible: boolean;
  isLocked?: boolean; // Admin-locked widgets
  config?: {
    description?: string;
    icon?: string;
    businessTypes?: BusinessType[];
    defaultOrder?: number;
    [key: string]: any;
  };
}

export interface DashboardLayout {
  userId: string;
  widgets: Widget[];
  layout: 'default' | 'custom';
  theme?: 'light' | 'dark';
  refreshInterval: number; // milliseconds
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Insight {
  id: string;
  type: 'warning' | 'opportunity' | 'alert' | 'info';
  title: string;
  description: string;
  icon: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  dismissible: boolean;
  widgetId?: string;
}

export interface InsightConfig {
  enableAnomalyDetection: boolean;
  anomalyThreshold: number; // percentage change
  enableTrendAnalysis: boolean;
  enableReorderAlerts: boolean;
  enablePaymentAlerts: boolean;
  lowStockThreshold: number; // percentage of reorder level
}

export const WIDGET_CONFIGS: Record<
  WidgetType,
  Omit<Widget, 'id' | 'position'>
> = {
  revenue_summary: {
    type: 'revenue_summary',
    title: 'Total Revenue',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Revenue for the current period with comparison',
      icon: 'DollarSign',
      businessTypes: [
        'retailer',
        'wholesaler',
        'distributor',
        'manufacturer',
        'service_provider'
      ],
      defaultOrder: 1
    }
  },
  sales_count: {
    type: 'sales_count',
    title: 'Sales Count',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Number of sales transactions',
      icon: 'ShoppingCart',
      businessTypes: ['retailer', 'wholesaler', 'distributor'],
      defaultOrder: 2
    }
  },
  customer_count: {
    type: 'customer_count',
    title: 'Total Customers',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Active customer count',
      icon: 'Users',
      businessTypes: ['retailer', 'wholesaler', 'service_provider'],
      defaultOrder: 3
    }
  },
  top_products: {
    type: 'top_products',
    title: 'Top Products',
    size: 'large',
    isVisible: true,
    config: {
      description: 'Best selling products this period',
      icon: 'TrendingUp',
      businessTypes: ['retailer', 'wholesaler', 'distributor'],
      defaultOrder: 4
    }
  },
  inventory_health: {
    type: 'inventory_health',
    title: 'Inventory Health',
    size: 'large',
    isVisible: true,
    config: {
      description: 'Stock levels and reorder alerts',
      icon: 'AlertCircle',
      businessTypes: ['retailer', 'wholesaler', 'distributor', 'manufacturer'],
      defaultOrder: 5
    }
  },
  cash_flow: {
    type: 'cash_flow',
    title: 'Cash Flow Status',
    size: 'large',
    isVisible: true,
    config: {
      description: 'Outstanding payments and receivables',
      icon: 'CreditCard',
      businessTypes: ['retailer', 'wholesaler', 'service_provider'],
      defaultOrder: 6
    }
  },
  profit_margin: {
    type: 'profit_margin',
    title: 'Profit Margin',
    size: 'large',
    isVisible: false,
    config: {
      description: 'Profit margin by product and category',
      icon: 'BarChart3',
      businessTypes: ['retailer', 'wholesaler', 'manufacturer'],
      defaultOrder: 7
    }
  },
  sales_trend: {
    type: 'sales_trend',
    title: 'Sales Trend',
    size: 'large',
    isVisible: true,
    config: {
      description: '30-day sales trend analysis',
      icon: 'LineChart',
      businessTypes: ['retailer', 'wholesaler', 'service_provider'],
      defaultOrder: 8
    }
  },
  inventory_turnover: {
    type: 'inventory_turnover',
    title: 'Inventory Turnover',
    size: 'medium',
    isVisible: false,
    config: {
      description: 'Inventory turnover ratio',
      icon: 'Repeat',
      businessTypes: ['retailer', 'wholesaler', 'manufacturer'],
      defaultOrder: 9
    }
  },
  supplier_performance: {
    type: 'supplier_performance',
    title: 'Supplier Performance',
    size: 'large',
    isVisible: false,
    config: {
      description: 'Top suppliers by purchase volume',
      icon: 'Truck',
      businessTypes: ['wholesaler', 'distributor', 'manufacturer'],
      defaultOrder: 10
    }
  },
  payment_status: {
    type: 'payment_status',
    title: 'Payment Status',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Pending and overdue payments',
      icon: 'Clock',
      businessTypes: ['retailer', 'wholesaler', 'service_provider'],
      defaultOrder: 11
    }
  },
  reorder_alerts: {
    type: 'reorder_alerts',
    title: 'Reorder Alerts',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Products requiring reorder',
      icon: 'AlertTriangle',
      businessTypes: ['retailer', 'wholesaler', 'manufacturer'],
      defaultOrder: 12
    }
  },
  profitability: {
    type: 'profitability',
    title: 'Profitability',
    size: 'large',
    isVisible: true,
    config: {
      description: 'Profit and loss analysis',
      icon: 'TrendingUp',
      businessTypes: [
        'retailer',
        'wholesaler',
        'distributor',
        'manufacturer',
        'service_provider'
      ],
      defaultOrder: 13
    }
  },
  budget_status: {
    type: 'budget_status',
    title: 'Budget Status',
    size: 'large',
    isVisible: false,
    config: {
      description: 'Budget allocation and spending',
      icon: 'PieChart',
      businessTypes: [
        'retailer',
        'wholesaler',
        'manufacturer',
        'service_provider'
      ],
      defaultOrder: 14
    }
  },
  expense_trend: {
    type: 'expense_trend',
    title: 'Expense Trend',
    size: 'large',
    isVisible: false,
    config: {
      description: 'Expense trends over time',
      icon: 'ArrowDown',
      businessTypes: [
        'retailer',
        'wholesaler',
        'manufacturer',
        'service_provider'
      ],
      defaultOrder: 15
    }
  },
  customer_insights: {
    type: 'customer_insights',
    title: 'Customer Insights',
    size: 'large',
    isVisible: false,
    config: {
      description: 'Customer analysis and insights',
      icon: 'Users',
      businessTypes: ['retailer', 'wholesaler', 'service_provider'],
      defaultOrder: 16
    }
  },
  // STEP 1.1: Cash Ledger Widget
  cash_ledger: {
    type: 'cash_ledger',
    title: 'Cash Balance',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Manual cash ledger (income - expenses)',
      icon: 'Wallet',
      businessTypes: [
        'retailer',
        'wholesaler',
        'distributor',
        'manufacturer',
        'service_provider'
      ],
      defaultOrder: 1
    }
  },
  // STEP 1.3: Receivables Aging Widget
  receivables_aging: {
    type: 'receivables_aging',
    title: 'Receivables Aging',
    size: 'medium',
    isVisible: true,
    config: {
      description: 'Unpaid invoices by age (Current/30/60/90+)',
      icon: 'Clock',
      businessTypes: ['retailer', 'wholesaler', 'distributor'],
      defaultOrder: 7
    }
  },
  // STEP 1.4: Top Vendors by Spend
  top_vendors: {
    type: 'top_vendors',
    title: 'Top Vendors',
    size: 'large',
    isVisible: true,
    config: {
      description: 'Highest spend vendors',
      icon: 'Truck',
      businessTypes: ['retailer', 'wholesaler', 'distributor', 'manufacturer'],
      defaultOrder: 8
    }
  }
};

// Default widget layouts by business type
export const DEFAULT_LAYOUTS: Record<BusinessType, WidgetType[]> = {
  retailer: [
    'revenue_summary',
    'sales_count',
    'customer_count',
    'top_products',
    'inventory_health',
    'sales_trend',
    'cash_ledger',
    'receivables_aging',
    'top_vendors'
  ],
  wholesaler: [
    'revenue_summary',
    'sales_count',
    'inventory_health',
    'supplier_performance',
    'sales_trend',
    'inventory_turnover',
    'cash_ledger',
    'top_vendors'
  ],
  distributor: [
    'revenue_summary',
    'sales_count',
    'inventory_health',
    'supplier_performance',
    'payment_status',
    'sales_trend',
    'cash_ledger',
    'receivables_aging',
    'top_vendors'
  ],
  manufacturer: [
    'revenue_summary',
    'customer_count',
    'inventory_health',
    'profit_margin',
    'supplier_performance',
    'inventory_turnover',
    'cash_ledger',
    'top_vendors'
  ],
  service_provider: [
    'revenue_summary',
    'sales_count',
    'customer_count',
    'cash_flow',
    'payment_status',
    'sales_trend',
    'cash_ledger'
  ]
};
