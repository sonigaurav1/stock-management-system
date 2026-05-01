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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function InventoryReconciliationWidget() {
  const reconciliations = useQuery(api.compliance.getInventoryReconciliations, {
    limit: 50
  });
  const recordReconciliation = useMutation(
    api.compliance.recordInventoryReconciliation
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    systemQuantity: 0,
    physicalQuantity: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recordReconciliation({
        productId: formData.productId,
        productName: formData.productName,
        systemQuantity: formData.systemQuantity,
        physicalQuantity: formData.physicalQuantity,
        notes: formData.notes
      });
      setFormData({
        productId: '',
        productName: '',
        systemQuantity: 0,
        physicalQuantity: 0,
        notes: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to record reconciliation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (reconciliations === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
      </div>
    );
  }

  const data = reconciliations as any;
  const records = data?.reconciliations || [];
  const summary = data?.summary || {};

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Total Reconciliations</p>
            <p className='mt-1 text-2xl font-bold'>{summary.total}</p>
          </CardContent>
        </Card>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-red-700'>Flagged</p>
            <p className='mt-1 text-2xl font-bold text-red-600'>
              {summary.flagged}
            </p>
          </CardContent>
        </Card>
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-green-700'>Reconciled</p>
            <p className='mt-1 text-2xl font-bold text-green-600'>
              {summary.reconciled}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Avg Variance</p>
            <p className='mt-1 text-2xl font-bold'>
              {(summary.averageVariance || 0).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Reconciliation Records</CardTitle>
              <CardDescription>
                Physical count vs system quantity
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Record Reconciliation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Inventory Reconciliation</DialogTitle>
                  <DialogDescription>
                    Compare physical count with system quantity
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='productId'>Product ID</Label>
                      <Input
                        id='productId'
                        value={formData.productId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            productId: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='productName'>Product Name</Label>
                      <Input
                        id='productName'
                        value={formData.productName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            productName: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='systemQty'>System Quantity</Label>
                      <Input
                        id='systemQty'
                        type='number'
                        value={formData.systemQuantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            systemQuantity: parseInt(e.target.value)
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='physicalQty'>Physical Quantity</Label>
                      <Input
                        id='physicalQty'
                        type='number'
                        value={formData.physicalQuantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            physicalQuantity: parseInt(e.target.value)
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='notes'>Notes</Label>
                    <Input
                      id='notes'
                      placeholder='e.g., Items damaged, Location change'
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>
                  <Button type='submit' disabled={loading} className='w-full'>
                    {loading ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : null}
                    Record Reconciliation
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <p>No reconciliation records yet</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className='text-right'>System Qty</TableHead>
                    <TableHead className='text-right'>Physical Qty</TableHead>
                    <TableHead className='text-right'>Variance</TableHead>
                    <TableHead className='text-right'>% Variance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 20).map((rec: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-medium'>
                        {rec.productName}
                      </TableCell>
                      <TableCell className='text-right'>
                        {rec.systemQuantity}
                      </TableCell>
                      <TableCell className='text-right'>
                        {rec.physicalQuantity}
                      </TableCell>
                      <TableCell className='text-right font-semibold'>
                        <span
                          className={
                            rec.variance < 0 ? 'text-red-600' : 'text-green-600'
                          }
                        >
                          {rec.variance > 0 ? '+' : ''}
                          {rec.variance}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        {rec.variancePercent?.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.status === 'flagged' ? 'destructive' : 'default'
                          }
                        >
                          {rec.status === 'flagged' ? (
                            <AlertTriangle className='mr-1 h-3 w-3' />
                          ) : (
                            <CheckCircle2 className='mr-1 h-3 w-3' />
                          )}
                          {rec.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-gray-600'>
                        {rec.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
