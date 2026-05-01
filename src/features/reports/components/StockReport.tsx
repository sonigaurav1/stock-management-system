'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Download,
  Filter,
  Loader2,
  BarChart3
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  calculateStockAnalysis,
  getInventoryByStatus,
  getDeadStock,
  getCategoryBreakdown,
  getStockStatusDistribution,
  getItemsBelowReorderLevel,
  exportStockToCSV,
  formatCurrency,
  type ProductData
} from '../utils/stockReportUtils';

/**
 * StockReport Component
 *
 * Provides comprehensive stock analytics including:
 * - Stock valuation and inventory value
 * - Dead stock identification
 * - Category-wise breakdown
 * - Stock status distribution
 * - Items below reorder level
 *
 * Features:
 * - Real-time inventory analysis
 * - ABC analysis (high-value items)
 * - Dead stock alerts
 * - Category performance
 * - Export capabilities
 */
const StockReport = () => {
  const [dayThreshold, setDayThreshold] = useState('90');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch product data
  const productsData = useQuery(api.products.getAllProducts);

  // Process data
  const {
    analysis,
    inventoryByStatus,
    deadStock,
    categoryBreakdown,
    statusDistribution,
    belowReorder
  } = useMemo(() => {
    if (!productsData) {
      return {
        analysis: null,
        inventoryByStatus: [],
        deadStock: [],
        categoryBreakdown: [],
        statusDistribution: [],
        belowReorder: []
      };
    }

    return {
      analysis: calculateStockAnalysis(productsData),
      inventoryByStatus: getInventoryByStatus(productsData),
      deadStock: getDeadStock(productsData, parseInt(dayThreshold)),
      categoryBreakdown: getCategoryBreakdown(productsData),
      statusDistribution: getStockStatusDistribution(productsData),
      belowReorder: getItemsBelowReorderLevel(productsData)
    };
  }, [productsData, dayThreshold]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (!productsData) return;
      exportStockToCSV(
        productsData,
        `stock-report-${new Date().toISOString().split('T')[0]}.csv`
      );
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = productsData === undefined;
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className='space-y-6'>
      {/* Filters Section */}
      <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-end'>
        <div className='min-w-[200px] flex-1'>
          <label className='mb-2 block text-sm font-medium'>
            Dead Stock Threshold (Days)
          </label>
          <Select value={dayThreshold} onValueChange={setDayThreshold}>
            <SelectTrigger>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='30'>30+ Days</SelectItem>
              <SelectItem value='60'>60+ Days</SelectItem>
              <SelectItem value='90'>90+ Days</SelectItem>
              <SelectItem value='180'>180+ Days</SelectItem>
              <SelectItem value='365'>1+ Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExport}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Download className='mr-2 h-4 w-4' />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='dead-stock' className='gap-2'>
            <TrendingDown className='h-4 w-4' />
            Dead Stock
          </TabsTrigger>
          <TabsTrigger value='categories' className='gap-2'>
            <Package className='h-4 w-4' />
            Categories
          </TabsTrigger>
          <TabsTrigger value='reorder' className='gap-2'>
            <AlertTriangle className='h-4 w-4' />
            Reorder
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          {/* Key Metrics */}
          {isLoading ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader className='pb-3'>
                    <div className='h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />
                  </CardHeader>
                  <CardContent>
                    <div className='h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>{analysis?.total || 0}</p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Items in inventory
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    In Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-green-600'>
                    {analysis?.inStock || 0}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {analysis?.total
                      ? Math.round((analysis.inStock / analysis.total) * 100)
                      : 0}
                    % of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Low Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {analysis?.lowStock || 0}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {analysis?.total
                      ? Math.round((analysis.lowStock / analysis.total) * 100)
                      : 0}
                    % of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Out of Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-red-600'>
                    {analysis?.outOfStock || 0}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {analysis?.total
                      ? Math.round((analysis.outOfStock / analysis.total) * 100)
                      : 0}
                    % of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(analysis?.totalStockValue || 0)}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Inventory valuation
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stock Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of inventory by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='h-64 animate-pulse rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800' />
              ) : statusDistribution.length > 0 ? (
                <ResponsiveContainer width='100%' height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-64 items-center justify-center rounded-lg border border-dashed bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
                  <p className='text-sm text-muted-foreground'>
                    No data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Stock Items by Value */}
          <Card>
            <CardHeader>
              <CardTitle>Top Stock Items by Value</CardTitle>
              <CardDescription>Highest value inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-4'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className='flex animate-pulse items-center justify-between rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='flex-1'>
                        <div className='mb-2 h-4 w-32 rounded bg-slate-200 dark:bg-slate-700' />
                        <div className='h-3 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                      </div>
                      <div className='text-right'>
                        <div className='h-4 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : inventoryByStatus.length > 0 ? (
                <div className='space-y-4'>
                  {inventoryByStatus.slice(0, 8).map((item, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between border-b pb-3 last:border-b-0'
                    >
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{item.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {item.category} • {item.quantity} units
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold'>
                          {formatCurrency(item.value)}
                        </p>
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs ${
                            item.status === 'in_stock'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : item.status === 'low_stock'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  No inventory data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dead Stock Tab */}
        <TabsContent value='dead-stock' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Dead Stock Items</CardTitle>
              <CardDescription>
                Items with no movement for {dayThreshold}+ days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className='animate-pulse rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='mb-2 h-4 w-40 rounded bg-slate-200 dark:bg-slate-700' />
                      <div className='h-3 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                    </div>
                  ))}
                </div>
              ) : deadStock.length > 0 ? (
                <div className='space-y-3'>
                  {deadStock.map((item, idx) => (
                    <div
                      key={idx}
                      className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium'>{item.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {item.category} • {item.quantity} units • Last
                            restocked: {item.lastRestocked}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold'>
                            {formatCurrency(item.value)}
                          </p>
                          <p className='text-xs text-red-600 dark:text-red-400'>
                            {item.daysSinceRestock} days ago
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center text-muted-foreground'>
                  <TrendingDown className='mx-auto mb-2 h-8 w-8 opacity-50' />
                  <p>No dead stock found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value='categories' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Stock value by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='h-64 animate-pulse rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800' />
              ) : categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='category'
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey='value' fill='#3b82f6' name='Stock Value' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-64 items-center justify-center rounded-lg border border-dashed bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
                  <p className='text-sm text-muted-foreground'>
                    No category data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-4'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='flex animate-pulse items-center justify-between rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='flex-1'>
                        <div className='mb-2 h-4 w-32 rounded bg-slate-200 dark:bg-slate-700' />
                        <div className='h-3 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                      </div>
                      <div className='text-right'>
                        <div className='h-4 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : categoryBreakdown.length > 0 ? (
                <div className='space-y-4'>
                  {categoryBreakdown.map((cat, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between border-b pb-3 last:border-b-0'
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>{cat.category}</p>
                        <p className='text-sm text-muted-foreground'>
                          {cat.items} products • {cat.quantity} units
                        </p>
                      </div>
                      <p className='font-semibold'>
                        {formatCurrency(cat.value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  No category data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder Tab */}
        <TabsContent value='reorder' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Items Below Reorder Level</CardTitle>
              <CardDescription>
                Products requiring immediate reordering
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className='animate-pulse rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='mb-2 h-4 w-40 rounded bg-slate-200 dark:bg-slate-700' />
                      <div className='h-3 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                    </div>
                  ))}
                </div>
              ) : belowReorder.length > 0 ? (
                <div className='space-y-3'>
                  {belowReorder.map((item, idx) => (
                    <div
                      key={idx}
                      className='rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium'>{item.name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {item.category} • Current: {item.quantity} units •
                            Reorder level: {item.reorderLevel}
                          </p>
                        </div>
                        <p className='text-right font-semibold'>
                          {formatCurrency(item.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center text-muted-foreground'>
                  <Package className='mx-auto mb-2 h-8 w-8 opacity-50' />
                  <p>All items are above reorder level</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pro Tips */}
      <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'>
        <CardHeader>
          <CardTitle className='text-base'>💡 Stock Management Tips</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <ul className='list-inside list-disc space-y-1'>
            <li>
              Monitor dead stock regularly and consider clearance sales to free
              up cash
            </li>
            <li>
              Set appropriate reorder levels based on average sales velocity
            </li>
            <li>
              Focus on high-value items (top 20%) that drive most of your
              inventory value
            </li>
            <li>
              Use stock valuation to understand true asset value and optimize
              working capital
            </li>
            <li>
              Track stock aging to identify slow-moving items early and avoid
              overstock
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReport;
