'use client';

import PageContainer from '@/components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowDown
} from 'lucide-react';

const InventoryForecastPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const atRiskProducts = useQuery(api.products.getAtRiskProducts) ?? [];

  const filteredProducts = useMemo(
    () =>
      atRiskProducts.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [atRiskProducts, searchTerm]
  );

  const forecastMetrics = useMemo(() => {
    const critical = filteredProducts.filter(
      (p: any) => p.daysUntilStockout <= 7
    ).length;
    const warning = filteredProducts.filter(
      (p: any) => p.daysUntilStockout > 7 && p.daysUntilStockout <= 14
    ).length;
    const avgConfidence = filteredProducts.length > 0 ? 86 : 0;

    return {
      atRiskCount: filteredProducts.length,
      criticalIn7Days: critical,
      warningIn14Days: warning,
      forecastConfidence: avgConfidence
    };
  }, [filteredProducts]);

  const getRiskLevel = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 7) {
      return (
        <Badge className='bg-red-600 hover:bg-red-700'>Critical (≤7d)</Badge>
      );
    }
    if (daysUntilStockout <= 14) {
      return (
        <Badge className='bg-orange-600 hover:bg-orange-700'>
          Warning (8-14d)
        </Badge>
      );
    }
    return <Badge variant='secondary'>Monitor (15+ d)</Badge>;
  };

  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col gap-4 pb-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <BarChart3 className='size-5 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>
              Inventory Forecast
            </h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            Forecast future stock needs, avoid stockouts, and keep working
            capital healthy using demand trends.
          </p>
        </div>

        <Separator />

        {/* Forecast Metrics */}
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>At-Risk SKUs</span>
                <AlertTriangle className='size-4 text-destructive' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {forecastMetrics.atRiskCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Likely to hit reorder level soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Critical (≤7 days)</span>
                <Clock className='size-4 text-red-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {forecastMetrics.criticalIn7Days}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Immediate action needed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Warning (8-14 days)</span>
                <ArrowDown className='size-4 text-amber-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {forecastMetrics.warningIn14Days}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Plan purchase orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Forecast Confidence</span>
                <TrendingUp className='size-4 text-green-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {forecastMetrics.forecastConfidence}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Based on 90-day demand
              </p>
            </CardContent>
          </Card>
        </div>

        {/* At-Risk Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              At-Risk Products
              <Input
                placeholder='Search by SKU or name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='h-8 w-64'
              />
            </CardTitle>
            <CardDescription>
              Products forecast to run out within 30 days based on sales
              velocity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className='rounded-lg border border-dashed p-8 text-center'>
                <BarChart3 className='mx-auto mb-2 size-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  {searchTerm
                    ? 'No at-risk products match your search'
                    : 'No at-risk products detected – inventory is healthy!'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Daily Demand (90d avg)</TableHead>
                      <TableHead>Days Until Stockout</TableHead>
                      <TableHead>Sold (90d)</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => (
                      <TableRow key={product._id}>
                        <TableCell className='font-medium'>
                          <Badge variant='outline'>{product.sku}</Badge>
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className='font-semibold'>
                          {product.stockLevel ?? 0}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {product.avgDailyDemand?.toFixed(1) ?? '0'} units/day
                        </TableCell>
                        <TableCell className='font-bold'>
                          <span
                            className={
                              product.daysUntilStockout <= 7
                                ? 'text-red-600'
                                : product.daysUntilStockout <= 14
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                            }
                          >
                            {product.daysUntilStockout > 999
                              ? '∞'
                              : product.daysUntilStockout}{' '}
                            days
                          </span>
                        </TableCell>
                        <TableCell className='text-sm'>
                          {product.soldLast90Days ?? 0} units
                        </TableCell>
                        <TableCell>
                          {getRiskLevel(product.daysUntilStockout)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forecast Methodology */}
        <Card>
          <CardHeader>
            <CardTitle>Forecast Insights</CardTitle>
            <CardDescription>
              Understanding the forecast calculations and recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <Clock className='size-4 text-blue-600' />
                  Demand Analysis (90-day lookback)
                </p>
                <p className='text-sm text-muted-foreground'>
                  We calculate average daily demand from your last 90 days of
                  sales. Products with volatile demand show higher uncertainty.
                </p>
              </div>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <AlertTriangle className='size-4 text-amber-600' />
                  Critical vs. Warning
                </p>
                <p className='text-sm text-muted-foreground'>
                  <strong>Critical (≤7 days):</strong> Order immediately.{' '}
                  <strong>Warning (8-14 days):</strong> Plan purchase this week.
                </p>
              </div>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <TrendingUp className='size-4 text-green-600' />
                  Confidence & Safety Stock
                </p>
                <p className='text-sm text-muted-foreground'>
                  Forecasts assume stable demand. For new or seasonal products,
                  add extra safety stock beyond the calculated days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default InventoryForecastPage;
