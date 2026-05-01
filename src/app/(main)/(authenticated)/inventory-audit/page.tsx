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
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ScanLine,
  Flag,
  AlertCircle
} from 'lucide-react';

// Format date to relative format (e.g., "3 days ago")
const getRelativeDate = (date: number | undefined): string => {
  if (!date) return 'Never';
  const now = Date.now();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Recently';
};

const InventoryAuditPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const auditMetrics = useQuery(api.products.getAuditMetrics);
  const allProducts = useQuery(api.products.getAllProducts) ?? [];

  // Memoize flagged products calculation
  const flaggedProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const isOutOfStock =
        product.stockStatus === 'out_of_stock' ||
        (product.stockLevel ?? 0) === 0;
      const isLowStock =
        product.reorderLevel &&
        product.stockLevel !== undefined &&
        product.stockLevel < product.reorderLevel;

      return isOutOfStock || isLowStock;
    });
  }, [allProducts]);

  // Filter flagged products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return flaggedProducts;
    const query = searchQuery.toLowerCase();
    return flaggedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.categoryName?.toLowerCase().includes(query)
    );
  }, [flaggedProducts, searchQuery]);
  const isLoadingMetrics = auditMetrics === undefined;
  const isLoadingProducts =
    allProducts.length === 0 && auditMetrics !== undefined;

  const metrics = auditMetrics || {
    totalProducts: allProducts.length,
    flaggedProducts: flaggedProducts.length,
    outOfStockCount: 0,
    lowStockCount: 0,
    accuracy: '100'
  };

  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col gap-4 pb-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <ScanLine className='size-5 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>
              Inventory Audit
            </h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            Verify physical inventory, detect stock mismatches, and keep your
            records accurate for confident business decisions.
          </p>
        </div>

        <Separator />

        {/* Audit Metrics Cards */}
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <Card className={isLoadingMetrics ? 'opacity-50' : ''}>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Total Products</span>
                <ClipboardCheck className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {isLoadingMetrics ? '...' : metrics.totalProducts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                SKUs in your inventory
              </p>
            </CardContent>
          </Card>

          <Card className={isLoadingMetrics ? 'opacity-50' : ''}>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Flagged for Audit</span>
                <Flag className='size-4 text-amber-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {isLoadingMetrics ? '...' : metrics.flaggedProducts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Requires verification
              </p>
            </CardContent>
          </Card>

          <Card className={isLoadingMetrics ? 'opacity-50' : ''}>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Out of Stock</span>
                <AlertCircle className='size-4 text-destructive' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {isLoadingMetrics ? '...' : metrics.outOfStockCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Zero inventory items
              </p>
            </CardContent>
          </Card>

          <Card className={isLoadingMetrics ? 'opacity-50' : ''}>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>System Accuracy</span>
                <CheckCircle2 className='size-4 text-green-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {isLoadingMetrics ? '...' : `${metrics.accuracy}%`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                Clean records ratio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='size-5 text-amber-600' />
              Products Requiring Audit Verification
            </CardTitle>
            <CardDescription>
              {metrics.flaggedProducts} product
              {metrics.flaggedProducts !== 1 ? 's' : ''} flagged for physical
              count verification
            </CardDescription>
            {flaggedProducts.length > 0 && (
              <div className='mt-4'>
                <input
                  type='text'
                  placeholder='Search by SKU, name, or category...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none'
                />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className='space-y-2'>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className='h-12 animate-pulse rounded bg-muted'
                  />
                ))}
              </div>
            ) : flaggedProducts.length === 0 ? (
              <div className='rounded-lg border border-dashed p-8 text-center'>
                <CheckCircle2 className='mx-auto mb-2 size-8 text-green-600' />
                <p className='text-sm text-muted-foreground'>
                  All inventory records are accurate!
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>System Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Last Restocked</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='py-8 text-center'>
                          <p className='text-sm text-muted-foreground'>
                            No products match your search
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => {
                        const lastRestockDate = getRelativeDate(
                          product.lastRestockedAt
                        );

                        return (
                          <TableRow key={product._id}>
                            <TableCell className='font-medium'>
                              <Badge variant='outline'>{product.sku}</Badge>
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell className='font-semibold'>
                              {product.stockLevel ?? 0}
                            </TableCell>
                            <TableCell>
                              {(product.stockLevel ?? 0) === 0 ? (
                                <Badge className='bg-red-600 hover:bg-red-700'>
                                  Out of Stock
                                </Badge>
                              ) : (
                                <Badge variant='secondary'>Low Stock</Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {product.categoryName}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {lastRestockDate}
                            </TableCell>
                            <TableCell className='text-right'>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8'
                                onClick={() =>
                                  router.push(
                                    `/inventory-audit/verify/${product._id}`
                                  )
                                }
                              >
                                Verify Count
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Process Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Process Checklist</CardTitle>
            <CardDescription>
              Follow this systematic process to maintain accurate inventory
              records.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <ClipboardCheck className='size-4 text-blue-600' />
                  Step 1: Prepare Audit
                </p>
                <p className='text-sm text-muted-foreground'>
                  Select flagged products above. Print count sheets or use
                  mobile device for scanning. Freeze inventory movements if
                  possible.
                </p>
              </div>
              <Badge variant='outline'>Step 1</Badge>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <ScanLine className='size-4 text-green-600' />
                  Step 2: Physical Count
                </p>
                <p className='text-sm text-muted-foreground'>
                  Count physical stock for each SKU. Record actual quantities,
                  note any damaged or expired goods. Use barcode scanner if
                  available.
                </p>
              </div>
              <Badge variant='secondary'>Step 2</Badge>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <AlertTriangle className='size-4 text-amber-600' />
                  Step 3: Identify Discrepancies
                </p>
                <p className='text-sm text-muted-foreground'>
                  Compare physical count against system stock. Document variance
                  reason: shrinkage, damage, entry error, misplacement, theft.
                </p>
              </div>
              <Badge className='bg-amber-600'>Step 3</Badge>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border p-3'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <CheckCircle2 className='size-4 text-green-600' />
                  Step 4: Reconcile & Record
                </p>
                <p className='text-sm text-muted-foreground'>
                  Update system stock levels, create adjustment transactions for
                  variances, and lock the audit record for compliance history.
                </p>
              </div>
              <Badge className='bg-green-600'>Step 4</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Audit Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>Best Practices for Accurate Audits</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex gap-2'>
              <span className='font-bold text-primary'>•</span>
              <p>
                <strong>Schedule regularly:</strong> Monthly for critical SKUs,
                quarterly for general inventory
              </p>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold text-primary'>•</span>
              <p>
                <strong>Conduct during low activity:</strong> Weekend or
                off-peak hours to reduce movement interference
              </p>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold text-primary'>•</span>
              <p>
                <strong>Use multiple counters:</strong> Have 2 people count each
                location for accuracy verification
              </p>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold text-primary'>•</span>
              <p>
                <strong>Document everything:</strong> Keep audit trail of dates,
                counters, and variances for future reference
              </p>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold text-primary'>•</span>
              <p>
                <strong>Investigate large variances:</strong> Variances &gt;5%
                indicate process issues that need addressing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default InventoryAuditPage;
