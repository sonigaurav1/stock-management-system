export interface ProductData {
  _id: string;
  name: string;
  categoryName: string;
  sku: string;
  stockLevel?: number;
  inStock: boolean;
  purchasePrice?: string;
  sellingPrice?: number;
  reorderLevel?: number;
  stockStatus: string;
  lastRestockedAt?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface StockAnalysis {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  averageStockValue: number;
  totalStockValue: number;
}

export interface InventoryItem {
  name: string;
  category: string;
  quantity: number;
  value: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  daysInStock: number;
  reorderLevel: number;
}

export interface DeadStockItem {
  name: string;
  category: string;
  quantity: number;
  value: number;
  lastRestocked: string;
  daysSinceRestock: number;
}

export interface CategoryBreakdown {
  category: string;
  quantity: number;
  value: number;
  items: number;
}

/**
 * Calculate overall stock analysis metrics
 */
export const calculateStockAnalysis = (
  products: ProductData[]
): StockAnalysis => {
  const inStockCount = products.filter((p) => p.stockLevel! > 0).length;
  const lowStockCount = products.filter(
    (p) => p.stockStatus === 'low_stock'
  ).length;
  const outOfStockCount = products.filter(
    (p) => p.stockStatus === 'out_of_stock'
  ).length;

  const totalValue = products.reduce((sum, p) => {
    const price = parseFloat(p.purchasePrice || '0');
    const quantity = p.stockLevel || 0;
    return sum + price * quantity;
  }, 0);

  const averageValue = products.length > 0 ? totalValue / products.length : 0;

  return {
    total: products.length,
    inStock: inStockCount,
    lowStock: lowStockCount,
    outOfStock: outOfStockCount,
    averageStockValue: averageValue,
    totalStockValue: totalValue
  };
};

/**
 * Get inventory breakdown by status
 */
export const getInventoryByStatus = (
  products: ProductData[]
): InventoryItem[] => {
  return products
    .map((product) => {
      const daysInStock = Math.floor(
        (Date.now() - (product.lastRestockedAt || product.createdAt)) /
          (1000 * 60 * 60 * 24)
      );

      const price = parseFloat(product.purchasePrice || '0');
      const value = (product.stockLevel || 0) * price;

      return {
        name: product.name,
        category: product.categoryName,
        quantity: product.stockLevel || 0,
        value,
        status: (product.stockStatus as any) || 'in_stock',
        daysInStock,
        reorderLevel: product.reorderLevel || 0
      };
    })
    .sort((a, b) => b.value - a.value);
};

/**
 * Identify dead stock (no movement for extended period)
 */
export const getDeadStock = (
  products: ProductData[],
  dayThreshold: number = 90
): DeadStockItem[] => {
  const now = Date.now();

  return products
    .filter((p) => p.stockLevel! > 0) // Only items with stock
    .map((product) => {
      const lastRestocked = product.lastRestockedAt || product.createdAt;
      const daysSinceRestock = Math.floor(
        (now - lastRestocked) / (1000 * 60 * 60 * 24)
      );

      const price = parseFloat(product.purchasePrice || '0');
      const value = (product.stockLevel || 0) * price;

      return {
        name: product.name,
        category: product.categoryName,
        quantity: product.stockLevel || 0,
        value,
        lastRestocked: new Date(lastRestocked).toLocaleDateString(),
        daysSinceRestock
      };
    })
    .filter((item) => item.daysSinceRestock >= dayThreshold)
    .sort((a, b) => b.daysSinceRestock - a.daysSinceRestock);
};

/**
 * Get stock value by category
 */
export const getCategoryBreakdown = (
  products: ProductData[]
): CategoryBreakdown[] => {
  const categoryMap = new Map<
    string,
    { quantity: number; value: number; items: number }
  >();

  products.forEach((product) => {
    const category = product.categoryName;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, { quantity: 0, value: 0, items: 0 });
    }

    const current = categoryMap.get(category)!;
    const price = parseFloat(product.purchasePrice || '0');
    const value = (product.stockLevel || 0) * price;

    current.quantity += product.stockLevel || 0;
    current.value += value;
    current.items += 1;
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      ...data
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Get stock status distribution
 */
export const getStockStatusDistribution = (
  products: ProductData[]
): Array<{ status: string; count: number; percentage: number }> => {
  const statusMap = new Map<string, number>();

  products.forEach((product) => {
    const status = product.stockStatus || 'in_stock';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const total = products.length;
  return Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Get items below reorder level
 */
export const getItemsBelowReorderLevel = (
  products: ProductData[]
): InventoryItem[] => {
  return products
    .filter(
      (p) =>
        p.reorderLevel &&
        p.stockLevel !== undefined &&
        p.stockLevel <= p.reorderLevel
    )
    .map((product) => {
      const price = parseFloat(product.purchasePrice || '0');
      const value = (product.stockLevel || 0) * price;

      return {
        name: product.name,
        category: product.categoryName,
        quantity: product.stockLevel || 0,
        value,
        status: (product.stockStatus as any) || 'low_stock',
        daysInStock: 0,
        reorderLevel: product.reorderLevel || 0
      };
    })
    .sort((a, b) => b.value - a.value);
};

/**
 * Export stock data to CSV
 */
export const exportStockToCSV = (
  products: ProductData[],
  filename: string = 'stock-report.csv'
) => {
  const headers = [
    'Product Name',
    'Category',
    'SKU',
    'Current Stock',
    'Reorder Level',
    'Unit Cost',
    'Stock Value',
    'Status',
    'Days in Stock'
  ];

  const rows = products.map((product) => {
    const price = parseFloat(product.purchasePrice || '0');
    const value = (product.stockLevel || 0) * price;
    const daysInStock = Math.floor(
      (Date.now() - (product.lastRestockedAt || product.createdAt)) /
        (1000 * 60 * 60 * 24)
    );

    return [
      product.name,
      product.categoryName,
      product.sku,
      product.stockLevel || 0,
      product.reorderLevel || 0,
      price.toFixed(2),
      value.toFixed(2),
      product.stockStatus,
      daysInStock
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
