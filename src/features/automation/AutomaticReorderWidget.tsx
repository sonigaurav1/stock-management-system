'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  Package,
  Zap
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function AutomaticReorderWidget() {
  const reorderData = useQuery(api.automation.checkAndCreateReorders);
  const createPO = useMutation(api.automation.createPurchaseOrder);
  const [creatingPO, setCreatingPO] = useState(false);

  const handleCreatePO = async (suppliers: Record<string, any>) => {
    setCreatingPO(true);
    try {
      for (const [supplierId, products] of Object.entries(suppliers)) {
        const supplierProducts = (products as any[]) || [];
        if (supplierProducts.length > 0) {
          const supplierName = supplierProducts[0].supplierName;
          await createPO({
            supplierId,
            supplierName,
            products: supplierProducts.map((p) => ({
              productId: p.productId,
              productName: p.productName,
              sku: p.sku,
              quantity: p.recommendedQuantity,
              unitPrice: 100 // Default, should come from product
            })),
            isAutomatic: true
          });
        }
      }
    } catch (error) {
      console.error('Failed to create PO:', error);
    } finally {
      setCreatingPO(false);
    }
  };

  if (reorderData === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    );
  }

  const reorderDataSafe = (reorderData || {}) as any;
  const {
    reorderCandidates = [],
    summary = {
      criticalCount: 0,
      highCount: 0,
      totalReorderValue: 0,
      suppliersAffected: 0,
      groupedBySupplier: {}
    }
  } = reorderDataSafe;

  return (
    <div className='space-y-6'>
      {/* Summary Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-red-600'>
                {summary.criticalCount}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Critical (Stock = 0)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-yellow-600'>
                {summary.highCount}
              </p>
              <p className='mt-1 text-sm text-gray-600'>High Priority</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-blue-600'>
                ₹{((summary.totalReorderValue || 0) / 100000).toFixed(1)}L
              </p>
              <p className='mt-1 text-sm text-gray-600'>Total Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder Candidates */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                Products Ready for Reorder
              </CardTitle>
              <CardDescription>
                {reorderCandidates.length} products below reorder level
              </CardDescription>
            </div>
            <Button
              onClick={() => handleCreatePO(summary?.groupedBySupplier || {})}
              disabled={creatingPO || reorderCandidates.length === 0}
              className='gap-2'
            >
              {creatingPO ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Creating POs...
                </>
              ) : (
                <>
                  <Zap className='h-4 w-4' />
                  Create POs
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reorderCandidates.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
              <CheckCircle2 className='mb-3 h-12 w-12 text-green-500' />
              <p className='font-medium'>All stock levels healthy</p>
              <p className='text-sm'>No reorders needed at this time</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className='text-right'>Current Stock</TableHead>
                    <TableHead className='text-right'>Reorder Level</TableHead>
                    <TableHead className='text-right'>
                      Recommended Qty
                    </TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reorderCandidates.map((candidate: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-medium'>
                        {candidate.productName}
                      </TableCell>
                      <TableCell className='text-sm text-gray-500'>
                        {candidate.sku}
                      </TableCell>
                      <TableCell className='text-right'>
                        {candidate.currentStock}
                      </TableCell>
                      <TableCell className='text-right'>
                        {candidate.reorderLevel}
                      </TableCell>
                      <TableCell className='text-right font-bold text-blue-600'>
                        {candidate.recommendedQuantity}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {candidate.supplierName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            candidate.priority === 'critical'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {candidate.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className='border-blue-200 bg-blue-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertCircle className='h-5 w-5 text-blue-600' />
            How Automatic Reorder Works
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white'>
              1
            </div>
            <p>System monitors stock levels in real-time</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white'>
              2
            </div>
            <p>
              When stock falls below reorder level, a recommendation is
              generated
            </p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white'>
              3
            </div>
            <p>You can review and create purchase orders with one click</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white'>
              4
            </div>
            <p>POs are automatically created and ready to send to suppliers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
