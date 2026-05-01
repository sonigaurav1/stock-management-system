import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';

interface PriceChange {
  id: string;
  product: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  changedBy: string;
  timestamp: string;
  requiresApproval: boolean;
  status: string;
}

const mockPriceChanges: PriceChange[] = [
  {
    id: '1',
    product: 'Laptop Pro',
    sku: 'SKU-001',
    oldPrice: 1200,
    newPrice: 1350,
    changePercent: 12.5,
    changedBy: 'John Manager',
    timestamp: 'Today 2:30 PM',
    requiresApproval: true,
    status: 'pending_approval'
  },
  {
    id: '2',
    product: 'USB Cable',
    sku: 'SKU-156',
    oldPrice: 5,
    newPrice: 4.5,
    changePercent: -10,
    changedBy: 'Sarah Procurement',
    timestamp: 'Today 10:15 AM',
    requiresApproval: true,
    status: 'approved'
  },
  {
    id: '3',
    product: 'Monitor 27"',
    sku: 'SKU-082',
    oldPrice: 350,
    newPrice: 365,
    changePercent: 4.3,
    changedBy: 'System',
    timestamp: 'Yesterday 5:00 PM',
    requiresApproval: false,
    status: 'auto_approved'
  }
];

export function PriceAudit() {
  const pendingApprovals = mockPriceChanges.filter(
    (p) => p.status === 'pending_approval'
  );
  const totalValueImpact = mockPriceChanges.reduce(
    (sum, p) => sum + (p.newPrice - p.oldPrice) * 100,
    0
  );

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Price Audit</CardTitle>
              <CardDescription>
                Track all price changes and approvals
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <TrendingUp className='h-4 w-4' />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Alerts */}
            {pendingApprovals.length > 0 && (
              <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900'>
                <div className='flex gap-2'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
                  <div>
                    <h4 className='text-sm font-semibold text-yellow-900 dark:text-yellow-100'>
                      {pendingApprovals.length} Price Changes Pending Approval
                    </h4>
                    <p className='mt-1 text-sm text-yellow-800 dark:text-yellow-200'>
                      Please review and approve or reject pending price changes
                      to maintain pricing consistency.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Total Changes (30d)
                </p>
                <p className='text-3xl font-bold'>{mockPriceChanges.length}</p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Pending Review
                </p>
                <p className='text-3xl font-bold text-yellow-600'>
                  {pendingApprovals.length}
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Total Revenue Impact
                </p>
                <p className='text-3xl font-bold text-green-600'>
                  +${totalValueImpact.toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Avg Change %
                </p>
                <p className='text-3xl font-bold'>5.3%</p>
              </div>
            </div>

            {/* Price Changes Table */}
            <div className='overflow-hidden rounded-lg border'>
              <table className='w-full text-sm'>
                <thead className='border-b bg-gray-50 dark:bg-slate-700'>
                  <tr>
                    <th className='p-3 text-left font-semibold'>Product</th>
                    <th className='p-3 text-left font-semibold'>SKU</th>
                    <th className='p-3 text-left font-semibold'>Old Price</th>
                    <th className='p-3 text-left font-semibold'>New Price</th>
                    <th className='p-3 text-left font-semibold'>Change</th>
                    <th className='p-3 text-left font-semibold'>Changed By</th>
                    <th className='p-3 text-left font-semibold'>Status</th>
                    <th className='p-3 text-left font-semibold'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPriceChanges.map((change) => (
                    <tr
                      key={change.id}
                      className='border-b hover:bg-gray-50 dark:hover:bg-slate-700'
                    >
                      <td className='p-3 font-medium'>{change.product}</td>
                      <td className='p-3 text-muted-foreground'>
                        {change.sku}
                      </td>
                      <td className='p-3'>${change.oldPrice.toFixed(2)}</td>
                      <td className='p-3'>${change.newPrice.toFixed(2)}</td>
                      <td className='p-3'>
                        <div className='flex items-center gap-1'>
                          {change.newPrice > change.oldPrice ? (
                            <TrendingUp className='h-4 w-4 text-red-600' />
                          ) : (
                            <TrendingDown className='h-4 w-4 text-green-600' />
                          )}
                          <span
                            className={
                              change.newPrice > change.oldPrice
                                ? 'text-red-600'
                                : 'text-green-600'
                            }
                          >
                            {change.newPrice > change.oldPrice ? '+' : ''}
                            {change.changePercent}%
                          </span>
                        </div>
                      </td>
                      <td className='p-3 text-muted-foreground'>
                        {change.changedBy}
                      </td>
                      <td className='p-3'>
                        <Badge
                          className={
                            change.status === 'pending_approval'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : change.status === 'approved'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }
                        >
                          {change.status === 'pending_approval'
                            ? 'Pending'
                            : change.status === 'approved'
                              ? 'Approved'
                              : 'Auto'}
                        </Badge>
                      </td>
                      <td className='p-3'>
                        {change.status === 'pending_approval' && (
                          <div className='flex gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-6 text-xs'
                            >
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-6 text-xs'
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Policy Info */}
            <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900'>
              <h4 className='mb-2 text-sm font-semibold text-indigo-900 dark:text-indigo-100'>
                Price Change Policy
              </h4>
              <ul className='space-y-1 text-sm text-indigo-800 dark:text-indigo-200'>
                <li>{`• Changes > 10% require manager approval`}</li>
                <li>• All changes are logged with timestamp and user</li>
                <li>• Price history is maintained for 2 years</li>
                <li>• Bulk price changes need supervisor sign-off</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
