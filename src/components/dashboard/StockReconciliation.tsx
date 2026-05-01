import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useState } from 'react';

interface Reconciliation {
  id: string;
  product: string;
  sku: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  variancePercent: number;
  status: string;
  location: string;
}

const mockReconciliations: Reconciliation[] = [
  {
    id: '1',
    product: 'Laptop Computer',
    sku: 'SKU-001',
    systemQty: 50,
    physicalQty: 48,
    variance: -2,
    variancePercent: -4,
    status: 'reconciled',
    location: 'Warehouse A'
  },
  {
    id: '2',
    product: 'Office Chair',
    sku: 'SKU-045',
    systemQty: 120,
    physicalQty: 105,
    variance: -15,
    variancePercent: -12.5,
    status: 'flagged',
    location: 'Warehouse B'
  },
  {
    id: '3',
    product: 'Desk',
    sku: 'SKU-032',
    systemQty: 80,
    physicalQty: 82,
    variance: 2,
    variancePercent: 2.5,
    status: 'reconciled',
    location: 'Warehouse A'
  }
];

export function StockReconciliation() {
  const [reconciliations, setReconciliations] =
    useState<Reconciliation[]>(mockReconciliations);
  const [showForm, setShowForm] = useState(false);

  const totalVariance = reconciliations.reduce(
    (sum, r) => sum + Math.abs(r.variance),
    0
  );
  const flaggedCount = reconciliations.filter(
    (r) => r.status === 'flagged'
  ).length;

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Stock Reconciliation</CardTitle>
              <CardDescription>
                Physical count vs system inventory
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className='gap-2'>
              <Plus className='h-4 w-4' />
              New Reconciliation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Total Variances
                </p>
                <p className='text-3xl font-bold'>{totalVariance}</p>
                <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                  Units
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Flagged Records
                </p>
                <p className='text-3xl font-bold text-red-600'>
                  {flaggedCount}
                </p>
                <p className='mt-1 text-xs text-red-600 dark:text-red-400'>
                  Review needed
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Recent Count
                </p>
                <p className='text-3xl font-bold'>{reconciliations.length}</p>
                <p className='mt-1 text-xs text-muted-foreground'>Products</p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Accuracy Rate
                </p>
                <p className='text-3xl font-bold text-green-600'>97.8%</p>
                <p className='mt-1 text-xs text-green-600 dark:text-green-400'>
                  Overall
                </p>
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className='rounded-lg border bg-gray-50 p-4 dark:bg-slate-700'>
                <h3 className='mb-3 font-semibold'>
                  Record New Reconciliation
                </h3>
                <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-3'>
                  <input
                    type='text'
                    placeholder='Product SKU'
                    className='rounded-lg border px-3 py-2 dark:bg-slate-800'
                  />
                  <input
                    type='number'
                    placeholder='System Quantity'
                    className='rounded-lg border px-3 py-2 dark:bg-slate-800'
                  />
                  <input
                    type='number'
                    placeholder='Physical Quantity'
                    className='rounded-lg border px-3 py-2 dark:bg-slate-800'
                  />
                </div>
                <div className='flex gap-2'>
                  <Button className='flex-1' size='sm'>
                    Record
                  </Button>
                  <Button
                    variant='outline'
                    className='flex-1'
                    size='sm'
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Reconciliations Table */}
            <div className='overflow-hidden rounded-lg border'>
              <table className='w-full text-sm'>
                <thead className='border-b bg-gray-50 dark:bg-slate-700'>
                  <tr>
                    <th className='p-3 text-left font-semibold'>Product</th>
                    <th className='p-3 text-left font-semibold'>SKU</th>
                    <th className='p-3 text-left font-semibold'>System</th>
                    <th className='p-3 text-left font-semibold'>Physical</th>
                    <th className='p-3 text-left font-semibold'>Variance</th>
                    <th className='p-3 text-left font-semibold'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliations.map((rec) => (
                    <tr
                      key={rec.id}
                      className='border-b hover:bg-gray-50 dark:hover:bg-slate-700'
                    >
                      <td className='p-3 font-medium'>{rec.product}</td>
                      <td className='p-3 text-muted-foreground'>{rec.sku}</td>
                      <td className='p-3'>{rec.systemQty}</td>
                      <td className='p-3'>{rec.physicalQty}</td>
                      <td className='p-3'>
                        <span
                          className={
                            rec.variance < 0 ? 'text-red-600' : 'text-green-600'
                          }
                        >
                          {rec.variance > 0 ? '+' : ''}
                          {rec.variance} ({rec.variancePercent}%)
                        </span>
                      </td>
                      <td className='p-3'>
                        <Badge
                          className={
                            rec.status === 'flagged'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }
                        >
                          {rec.status === 'flagged' ? (
                            <AlertTriangle className='mr-1 inline h-3 w-3' />
                          ) : (
                            <CheckCircle className='mr-1 inline h-3 w-3' />
                          )}
                          {rec.status === 'flagged' ? 'Flagged' : 'OK'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h4 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Recommendations
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>
                  • Investigate Office Chair variance of -12.5% in Warehouse B
                </li>
                <li>• Perform full cycle count in high-variance locations</li>
                <li>• Update system records after physical verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
