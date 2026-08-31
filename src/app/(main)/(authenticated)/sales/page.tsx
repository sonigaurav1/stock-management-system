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
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useCallbackRef } from '@/hooks/useCallbackRef';
import {
  PackagePlus,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface Product {
  _id: string;
  name: string;
  sku: string;
  stockLevel?: number;
  reorderLevel?: number;
}

interface BulkResult {
  successCount: number;
  totalItems: number;
  failureCount: number;
  results: Array<{
    success: boolean;
    productName?: string;
    productId?: string;
    previousStock?: number;
    newStock?: number;
    quantityAdded?: number;
    error?: string;
  }>;
}

const RestockPage = () => {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [bulkQuantities, setBulkQuantities] = useState<Map<string, number>>(
    new Map()
  );
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [isBulkRestocking, setIsBulkRestocking] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchProductTerm, setSearchProductTerm] = useState('');
  const [restockList, setRestockList] = useState<
    Map<string, { product: Product; quantity: number }>
  >(new Map());
  const [showRestockConfirm, setShowRestockConfirm] = useState(false);

  const lowStockProducts = useQuery(api.products.getLowStockProducts) ?? [];
  // STEP 4.1: Use at-risk products for urgency-sorted restock alerts
  const atRiskProducts = useQuery(api.products.getAtRiskProducts) ?? [];
  const allProducts = useQuery(api.products.getAllProducts) ?? [];
  const bulkRestockMutation = useMutation(api.products.bulkRestockProducts);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const filteredProducts = useMemo(
    () =>
      lowStockProducts.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [lowStockProducts, debouncedSearchTerm]
  );

  const debouncedProductSearchTerm = useDebounce(searchProductTerm, 300);
  const searchedProducts = useMemo(
    () =>
      allProducts.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedProductSearchTerm.toLowerCase()) ||
          product.sku
            .toLowerCase()
            .includes(debouncedProductSearchTerm.toLowerCase())
      ),
    [allProducts, debouncedProductSearchTerm]
  );

  const restockMetrics = useMemo(() => {
    const critical = lowStockProducts.filter(
      (p) => (p.stockLevel ?? 0) === 0
    ).length;
    const low = lowStockProducts.filter(
      (p) =>
        (p.stockLevel ?? 0) > 0 && (p.stockLevel ?? 0) < (p.reorderLevel ?? 1)
    ).length;

    return {
      totalLowStock: lowStockProducts.length,
      criticalStockouts: critical,
      needsRestock: low,
      estimatedPOs: Math.ceil(lowStockProducts.length / 2)
    };
  }, [lowStockProducts]);

  const selectedProductsList = useMemo(() => {
    return Array.from(selectedProducts)
      .map((id) => lowStockProducts.find((p) => p._id === id))
      .filter(Boolean);
  }, [selectedProducts, lowStockProducts]);

  const getUrgencyBadge = (product: Product) => {
    if ((product.stockLevel ?? 0) === 0) {
      return <Badge className='bg-red-600 hover:bg-red-700'>Critical</Badge>;
    }
    const percentOfReorder =
      ((product.stockLevel ?? 0) / (product.reorderLevel ?? 1)) * 100;
    if (percentOfReorder < 25) {
      return (
        <Badge className='bg-orange-600 hover:bg-orange-700'>Urgent</Badge>
      );
    }
    return <Badge variant='secondary'>Low</Badge>;
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Keyboard shortcuts and undo
  const selectionHistory: string[][] = [];
  const historyLimit = 20;

  const saveSelectionHistory = useCallback(() => {
    selectionHistory.push(Array.from(selectedProducts));
    if (selectionHistory.length > historyLimit) {
      selectionHistory.shift();
    }
  }, [selectedProducts]);

  const undoSelection = useCallback(() => {
    if (selectionHistory.length > 0) {
      const previous = selectionHistory.pop()!;
      setSelectedProducts(new Set(previous));
    }
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (
      selectedProducts.size === filteredProducts.length &&
      filteredProducts.length > 0
    ) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p._id)));
    }
    saveSelectionHistory();
  }, [filteredProducts, selectedProducts, saveSelectionHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            toggleSelectAll();
            saveSelectionHistory();
            break;
          case 'd':
            e.preventDefault();
            setSelectedProducts(new Set());
            saveSelectionHistory();
            break;
          case 'z':
            if (e.shiftKey) return; // Ctrl+Shift+Z redo not implemented
            e.preventDefault();
            undoSelection();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSelectAll, saveSelectionHistory, undoSelection]);

  const updateBulkQuantity = (productId: string, quantity: number) => {
    const newQuantities = new Map(bulkQuantities);
    if (quantity > 0) {
      newQuantities.set(productId, quantity);
    } else {
      newQuantities.delete(productId);
    }
    setBulkQuantities(newQuantities);
  };

  const addProductToRestockList = (product: Product, quantity: number = 1) => {
    if (quantity <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a quantity greater than 0',
        variant: 'destructive'
      });
      return;
    }

    const newList = new Map(restockList);
    newList.set(product._id, { product, quantity });
    setRestockList(newList);
    setSearchProductTerm('');
  };

  const removeProductFromRestockList = (productId: string) => {
    const newList = new Map(restockList);
    newList.delete(productId);
    setRestockList(newList);
  };

  const updateRestockQuantity = (productId: string, quantity: number) => {
    const newList = new Map(restockList);
    const item = newList.get(productId);
    if (item) {
      newList.set(productId, { ...item, quantity });
    }
    setRestockList(newList);
  };

  const handleProcessRestockList = async () => {
    if (restockList.size === 0) {
      toast({
        title: 'No Products',
        description: 'Please add products to restock list first',
        variant: 'destructive'
      });
      return;
    }

    setIsBulkRestocking(true);

    try {
      const restockItems = Array.from(restockList.values()).map((item) => ({
        productId: item.product._id,
        quantityToAdd: item.quantity
      }));

      const result = await bulkRestockMutation({ restockItems });
      setBulkResult(result);
      setRestockList(new Map());
      setShowRestockConfirm(false);
    } catch (error) {
      console.error('Bulk restock error:', error);
      toast({
        title: 'Restock Failed',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsBulkRestocking(false);
    }
  };

  const handleBulkRestock = async () => {
    const restockItems = Array.from(selectedProducts).map((productId) => ({
      productId,
      quantityToAdd: bulkQuantities.get(productId) || 1
    }));

    try {
      const result = await bulkRestockMutation({
        restockItems
      });
      setBulkResult(result);
    } catch (err) {
      console.error('Bulk restock error:', err);
      toast({
        title: 'Bulk Restock Failed',
        description: 'Please check your selections and try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col gap-4 pb-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <PackagePlus className='size-5 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>
              Stock & Restock
            </h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            Monitor low stock products, prioritize replenishment, and plan
            purchase orders before inventory gaps affect sales.
          </p>
        </div>

        <Separator />

        {/* Metrics Cards */}
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Low Stock Items</span>
                <PackagePlus className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {restockMetrics.totalLowStock}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Critical Stockouts</span>
                <AlertTriangle className='size-4 text-destructive' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {restockMetrics.criticalStockouts}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Needs Restock</span>
                <Zap className='size-4 text-amber-600' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {restockMetrics.needsRestock}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>POs To Create</span>
                <ShoppingCart className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {restockMetrics.estimatedPOs}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Bulk Restock Panel */}
        {selectedProducts.size > 0 && (
          <Card className='border-primary/50 bg-primary/5'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <CheckCircle2 className='size-5 text-primary' />
                    Bulk Restock
                  </CardTitle>
                  <CardDescription>
                    {selectedProducts.size} product
                    {selectedProducts.size !== 1 ? 's' : ''} selected
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowBulkDialog(true)}
                  disabled={isBulkRestocking}
                  className='gap-2'
                >
                  <ShoppingCart className='size-4' />
                  Process Restock
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Manual Restock Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <ShoppingCart className='size-5 text-primary' />
                Manual Restock
              </span>
              <Button
                onClick={() => setShowProductSearch(true)}
                className='gap-2'
              >
                <Plus className='size-4' />
                Add Products to Restock
              </Button>
            </CardTitle>
            <CardDescription>
              Search and add any product to restock, regardless of current stock
              level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {restockList.size === 0 ? (
              <div className='rounded-lg border border-dashed p-8 text-center'>
                <ShoppingCart className='mx-auto mb-2 size-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  No products added yet. Click "Add Products to Restock" to get
                  started.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {Array.from(restockList.values()).map((item) => (
                  <div
                    key={item.product._id}
                    className='flex items-center justify-between rounded-lg border bg-muted/30 p-3'
                  >
                    <div className='flex-1'>
                      <p className='font-medium'>{item.product.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        SKU: {item.product.sku} | Current:{' '}
                        {item.product.stockLevel ?? 0} units
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Input
                        type='number'
                        min='1'
                        value={item.quantity}
                        onChange={(e) =>
                          updateRestockQuantity(
                            item.product._id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className='h-8 w-20 text-center'
                        placeholder='Qty'
                      />
                      <Button
                        size='sm'
                        variant='destructive'
                        className='h-8 w-8'
                        onClick={() =>
                          removeProductFromRestockList(item.product._id)
                        }
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className='mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
                  <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                    Ready to restock {restockList.size} product
                    {restockList.size !== 1 ? 's' : ''}
                  </p>
                  <p className='text-xs text-blue-700 dark:text-blue-200'>
                    Total quantity:{' '}
                    {Array.from(restockList.values()).reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{' '}
                    units
                  </p>
                </div>
                <Button
                  onClick={() => setShowRestockConfirm(true)}
                  disabled={isBulkRestocking || restockList.size === 0}
                  className='mt-4 w-full gap-2'
                >
                  {isBulkRestocking && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  {isBulkRestocking
                    ? 'Processing...'
                    : 'Confirm & Process Restock'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Low Stock Products</span>
              <Input
                placeholder='Search by SKU or name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='h-8 w-64'
              />
            </CardTitle>
            <CardDescription>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? 's' : ''} requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className='rounded-lg border border-dashed p-8 text-center'>
                <PackagePlus className='mx-auto mb-2 size-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  {searchTerm
                    ? 'No products match your search'
                    : 'No low stock items detected'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>
                        <div className='flex items-center justify-center'>
                          <Checkbox
                            checked={
                              filteredProducts.length > 0 &&
                              selectedProducts.size === filteredProducts.length
                            }
                            onCheckedChange={toggleSelectAll}
                          />
                        </div>
                      </TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      {/* STEP 4.1: Show Days Until Stockout */}
                      <TableHead>Days Left</TableHead>
                      <TableHead>Shortage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Qty to Add</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const shortage =
                        (product.reorderLevel ?? 0) - (product.stockLevel ?? 0);
                      const isSelected = selectedProducts.has(product._id);
                      const bulkQty = bulkQuantities.get(product._id) || 0;

                      return (
                        <TableRow
                          key={product._id}
                          className={isSelected ? 'bg-primary/5' : ''}
                        >
                          <TableCell>
                            <div className='flex items-center justify-center'>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleProductSelection(product._id)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className='font-medium'>
                            <Badge variant='outline'>{product.sku}</Badge>
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className='font-semibold'>
                            {product.stockLevel ?? 0}
                          </TableCell>
                          <TableCell>{product.reorderLevel ?? 0}</TableCell>
                          {/* STEP 4.1: Show Days Until Stockout */}
                          <TableCell>
                            {(product as any).daysUntilStockout !==
                            undefined ? (
                              <span
                                className={`font-semibold ${
                                  (product as any).daysUntilStockout <= 7
                                    ? 'text-red-600'
                                    : (product as any).daysUntilStockout <= 14
                                      ? 'text-orange-600'
                                      : (product as any).daysUntilStockout <= 30
                                        ? 'text-yellow-600'
                                        : 'text-green-600'
                                }`}
                              >
                                {(product as any).daysUntilStockout === 999
                                  ? '∞'
                                  : (product as any).daysUntilStockout}
                              </span>
                            ) : (
                              <span className='text-muted-foreground'>-</span>
                            )}
                          </TableCell>
                          <TableCell className='font-medium text-orange-600'>
                            +{shortage}
                          </TableCell>
                          <TableCell>{getUrgencyBadge(product)}</TableCell>
                          <TableCell>
                            {isSelected ? (
                              <Input
                                type='number'
                                min='0'
                                placeholder='Qty'
                                value={bulkQty}
                                onChange={(e) =>
                                  updateBulkQuantity(
                                    product._id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className='h-8 w-20'
                              />
                            ) : (
                              <span className='text-sm text-muted-foreground'>
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-8 gap-1'
                              onClick={() => {
                                if (!isSelected) {
                                  setSelectedProducts(
                                    new Set([...selectedProducts, product._id])
                                  );
                                }
                              }}
                            >
                              Select
                              <ArrowRight className='size-3' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restock Priority Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Restock Priority Guide</CardTitle>
            <CardDescription>
              Suggested sequence for handling low stock based on urgency level.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <AlertTriangle className='size-4 text-red-600' />
                  Critical Stockouts (0 units)
                </p>
                <p className='text-sm text-muted-foreground'>
                  Immediate action required – Place emergency order to avoid
                  sales loss
                </p>
              </div>
              <Badge className='bg-red-600'>Priority 1</Badge>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <Zap className='size-4 text-amber-600' />
                  Urgent Low Stock (&lt;25% of reorder level)
                </p>
                <p className='text-sm text-muted-foreground'>
                  This week – Order enough to reach reorder level plus safety
                  stock
                </p>
              </div>
              <Badge variant='secondary'>Priority 2</Badge>
            </div>

            <div className='flex items-start justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950'>
              <div>
                <p className='flex items-center gap-2 font-medium'>
                  <ShoppingCart className='size-4 text-blue-600' />
                  Low Stock (between reorder level and safe threshold)
                </p>
                <p className='text-sm text-muted-foreground'>
                  Next planned purchase cycle – Group with other items for
                  efficiency
                </p>
              </div>
              <Badge variant='outline'>Priority 3</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Restock Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Restock</DialogTitle>
            <DialogDescription>
              Review and confirm the stock quantities before processing
            </DialogDescription>
          </DialogHeader>

          {!bulkResult ? (
            <div className='space-y-4'>
              <div className='max-h-96 space-y-2 overflow-y-auto'>
                {selectedProductsList.map((product) => {
                  if (!product) return null;
                  const qty = bulkQuantities.get(product._id) || 0;
                  const newStock = (product.stockLevel ?? 0) + qty;

                  return (
                    <div
                      key={product._id}
                      className='flex items-center justify-between rounded-lg border p-3'
                    >
                      <div className='flex-1'>
                        <p className='font-medium'>{product.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {product.sku}
                        </p>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <div className='text-right'>
                          <p className='text-muted-foreground'>Current</p>
                          <p className='font-semibold'>
                            {product.stockLevel ?? 0}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground'>+ Add</p>
                          <p className='font-bold text-primary'>{qty}</p>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground'>New Total</p>
                          <p className='font-bold text-green-600'>{newStock}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  Total products to update: {selectedProducts.size}
                </p>
                <p className='text-xs text-blue-700 dark:text-blue-200'>
                  Total quantity adding:{' '}
                  {Array.from(bulkQuantities.values()).reduce(
                    (sum, qty) => sum + qty,
                    0
                  )}{' '}
                  units
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setShowBulkDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkRestock}
                  disabled={isBulkRestocking}
                  className='gap-2'
                >
                  {isBulkRestocking && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  {isBulkRestocking ? 'Processing...' : 'Confirm Restock'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='rounded-lg bg-green-50 p-4 dark:bg-green-950'>
                <div className='flex items-center gap-2 font-semibold text-green-900 dark:text-green-100'>
                  <CheckCircle2 className='size-5' />
                  Bulk Restock Completed!
                </div>
                <p className='mt-1 text-sm text-green-700 dark:text-green-200'>
                  {bulkResult.successCount} of {bulkResult.totalItems} products
                  updated successfully
                </p>
              </div>

              {bulkResult.results
                .filter((r: any) => r.success)
                .map((result: any, idx: number) => (
                  <div
                    key={idx}
                    className='rounded border-l-4 border-green-500 p-2 text-sm'
                  >
                    <p className='font-medium'>{result.productName}</p>
                    <p className='text-xs text-muted-foreground'>
                      {result.previousStock} → {result.newStock} (+
                      {result.quantityAdded})
                    </p>
                  </div>
                ))}

              {bulkResult.failureCount > 0 && (
                <div className='rounded-lg bg-amber-50 p-3 dark:bg-amber-950'>
                  <p className='flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100'>
                    <AlertCircle className='size-4' />
                    {bulkResult.failureCount} item(s) failed
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowBulkDialog(false);
                    setSelectedProducts(new Set());
                    setBulkQuantities(new Map());
                    setBulkResult(null);
                  }}
                  className='w-full'
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Search Dialog (New Manual Restock) */}
      <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Search and Add Products to Restock</DialogTitle>
            <DialogDescription>
              Find any product in your inventory to restock, regardless of
              current stock level
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              placeholder='Search by product name or SKU...'
              value={searchProductTerm}
              onChange={(e) => setSearchProductTerm(e.target.value)}
              className='h-10'
            />
            <div className='max-h-96 overflow-y-auto rounded-lg border'>
              {searchedProducts.length === 0 ? (
                <div className='p-8 text-center text-muted-foreground'>
                  <Search className='mx-auto mb-2 size-8 opacity-50' />
                  <p>No products found</p>
                </div>
              ) : (
                <div className='divide-y'>
                  {searchedProducts.map((product) => (
                    <div
                      key={product._id}
                      className='flex items-center justify-between p-3 hover:bg-muted/50'
                    >
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{product.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          SKU: {product.sku} | Current Stock:{' '}
                          {product.stockLevel ?? 0}
                        </p>
                      </div>
                      <Button
                        size='sm'
                        onClick={() => {
                          addProductToRestockList(product, 1);
                          setSearchProductTerm('');
                          setShowProductSearch(false);
                        }}
                        className='gap-2'
                      >
                        <Plus className='size-4' />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowProductSearch(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Restock Confirmation Dialog */}
      <Dialog open={showRestockConfirm} onOpenChange={setShowRestockConfirm}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Confirm Restock</DialogTitle>
            <DialogDescription>
              Review items before processing
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-64 space-y-3 overflow-y-auto'>
            {Array.from(restockList.values()).map((item) => (
              <div
                key={item.product._id}
                className='rounded-lg border p-2 text-sm'
              >
                <p className='font-medium'>{item.product.name}</p>
                <p className='text-xs text-muted-foreground'>
                  Current: {item.product.stockLevel ?? 0} → +{item.quantity} ={' '}
                  {(item.product.stockLevel ?? 0) + item.quantity}
                </p>
              </div>
            ))}
            <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
              <p className='text-xs font-medium text-blue-900 dark:text-blue-100'>
                Total products: {restockList.size}
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-200'>
                Total units to add:{' '}
                {Array.from(restockList.values()).reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowRestockConfirm(false)}
              disabled={isBulkRestocking}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleProcessRestockList()}
              disabled={isBulkRestocking}
            >
              {isBulkRestocking && (
                <Loader2 className='mr-2 size-4 animate-spin' />
              )}
              {isBulkRestocking ? 'Processing...' : 'Confirm & Restock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default RestockPage;
