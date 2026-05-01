import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Calendar } from 'lucide-react';
import { useState } from 'react';

interface DiscountRecord {
  id: string;
  orderId: string;
  discountType: string;
  amount: number;
  percentOfSale: number;
  appliedBy: string;
  customer: string;
  timestamp: string;
  status: string;
  requiresApproval: boolean;
}

const mockDiscounts: DiscountRecord[] = [
  {
    id: '1',
    orderId: 'ORD-5432',
    discountType: 'Loyalty Discount',
    amount: 125,
    percentOfSale: 8.5,
    appliedBy: 'Mike Sales',
    customer: 'ABC Corp',
    timestamp: 'Today 3:45 PM',
    status: 'approved',
    requiresApproval: false
  },
  {
    id: '2',
    orderId: 'ORD-5431',
    discountType: 'Bulk Order',
    amount: 750,
    percentOfSale: 15.2,
    appliedBy: 'John Manager',
    customer: 'XYZ Industries',
    timestamp: 'Today 2:20 PM',
    status: 'pending',
    requiresApproval: true
  },
  {
    id: '3',
    orderId: 'ORD-5430',
    discountType: 'Volume Tier',
    amount: 500,
    percentOfSale: 12.3,
    appliedBy: 'Sarah Sales',
    customer: 'Tech Solutions',
    timestamp: 'Today 1:00 PM',
    status: 'approved',
    requiresApproval: true
  }
];

export function DiscountAudit() {
  const [discounts, setDiscounts] = useState<DiscountRecord[]>(mockDiscounts);
  const [filterStatus, setFilterStatus] = useState('all');

  const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);
  const pendingApprovals = discounts.filter((d) => d.status === 'pending');
  const highValueDiscounts = discounts.filter((d) => d.amount > 500);

  const filtered = discounts.filter((d) =>
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Discount Audit</CardTitle>
              <CardDescription>
                Monitor all discounts and approval workflows
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <Calendar className='h-4 w-4' />
              View Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Alerts */}
            {pendingApprovals.length > 0 && (
              <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900'>
                <div className='flex gap-2'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
                  <div>
                    <h4 className='text-sm font-semibold text-yellow-900 dark:text-yellow-100'>
                      {pendingApprovals.length} Discounts Awaiting Approval
                    </h4>
                    <p className='mt-1 text-sm text-yellow-800 dark:text-yellow-200'>
                      Total pending: $
                      {pendingApprovals
                        .reduce((sum, d) => sum + d.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Total Discounts (30d)
                </p>
                <p className='text-3xl font-bold text-rose-600'>
                  ${totalDiscounts.toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Pending Approval
                </p>
                <p className='text-3xl font-bold text-yellow-600'>
                  $
                  {pendingApprovals
                    .reduce((sum, d) => sum + d.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  High Value (greater than $500)
                </p>
                <p className='text-3xl font-bold'>
                  {highValueDiscounts.length}
                </p>
              </div>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Avg Discount %
                </p>
                <p className='text-3xl font-bold'>11.7%</p>
              </div>
            </div>

            {/* Filter */}
            <div className='flex gap-2'>
              {['all', 'approved', 'pending'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setFilterStatus(status)}
                  className='capitalize'
                >
                  {status === 'all' ? 'All' : status}
                </Button>
              ))}
            </div>

            {/* Discount Records Table */}
            <div className='overflow-hidden rounded-lg border'>
              <table className='w-full text-sm'>
                <thead className='border-b bg-gray-50 dark:bg-slate-700'>
                  <tr>
                    <th className='p-3 text-left font-semibold'>Order ID</th>
                    <th className='p-3 text-left font-semibold'>Customer</th>
                    <th className='p-3 text-left font-semibold'>Type</th>
                    <th className='p-3 text-left font-semibold'>Amount</th>
                    <th className='p-3 text-left font-semibold'>% of Sale</th>
                    <th className='p-3 text-left font-semibold'>Applied By</th>
                    <th className='p-3 text-left font-semibold'>Status</th>
                    <th className='p-3 text-left font-semibold'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((discount) => (
                    <tr
                      key={discount.id}
                      className='border-b hover:bg-gray-50 dark:hover:bg-slate-700'
                    >
                      <td className='p-3 font-medium'>{discount.orderId}</td>
                      <td className='p-3'>{discount.customer}</td>
                      <td className='p-3'>{discount.discountType}</td>
                      <td className='p-3 font-semibold text-rose-600'>
                        ${discount.amount.toLocaleString()}
                      </td>
                      <td className='p-3'>
                        <div className='flex items-center gap-1'>
                          <TrendingDown className='h-4 w-4 text-rose-600' />
                          <span className='text-rose-600'>
                            {discount.percentOfSale}%
                          </span>
                        </div>
                      </td>
                      <td className='p-3 text-muted-foreground'>
                        {discount.appliedBy}
                      </td>
                      <td className='p-3'>
                        <Badge
                          className={
                            discount.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }
                        >
                          {discount.status === 'pending'
                            ? 'Pending'
                            : 'Approved'}
                        </Badge>
                      </td>
                      <td className='p-3'>
                        {discount.status === 'pending' && (
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

            {/* Policy */}
            <div className='rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-700 dark:bg-rose-900'>
              <h4 className='mb-2 text-sm font-semibold text-rose-900 dark:text-rose-100'>
                Discount Policy
              </h4>
              <ul className='space-y-1 text-sm text-rose-800 dark:text-rose-200'>
                <li>• Discounts exceeding $500 require manager approval</li>
                <li>• Maximum discount per transaction: 20%</li>
                <li>• All discounts logged with user and timestamp</li>
                <li>• Sales reps limited to 5 discounts per day</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
