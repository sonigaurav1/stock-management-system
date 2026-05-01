import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, Filter } from 'lucide-react';
import { useState } from 'react';

interface AuditLog {
  id: string;
  entityType: string;
  action: string;
  changedBy: string;
  timestamp: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

const mockLogs: AuditLog[] = [
  {
    id: '1',
    entityType: 'Price Change',
    action: 'Updated',
    changedBy: 'John Manager',
    timestamp: 'Today 2:30 PM',
    details: 'Product SKU-123 price changed from $50.00 to $55.00',
    oldValue: 50,
    newValue: 55
  },
  {
    id: '2',
    entityType: 'Stock Adjustment',
    action: 'Updated',
    changedBy: 'Sarah Warehouse',
    timestamp: 'Today 1:15 PM',
    details: 'Product SKU-456 stock adjusted from 100 to 95 units',
    oldValue: 100,
    newValue: 95
  },
  {
    id: '3',
    entityType: 'Discount',
    action: 'Created',
    changedBy: 'Mike Sales',
    timestamp: 'Today 11:45 AM',
    details: 'Discount of 15% applied to order #ORD-5432',
    oldValue: 0,
    newValue: 15
  },
  {
    id: '4',
    entityType: 'Tax Payment',
    action: 'Recorded',
    changedBy: 'System',
    timestamp: 'Yesterday 5:00 PM',
    details: 'Quarterly tax payment of $2,500 recorded',
    oldValue: null,
    newValue: 2500
  }
];

export function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.changedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      log.entityType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Created':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'Updated':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'Deleted':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'Recorded':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete record of all system changes and who made them
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <Download className='h-4 w-4' />
              Export Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Filters & Search */}
            <div className='flex flex-wrap gap-2'>
              <div className='flex min-w-64 flex-1 items-center gap-2'>
                <Search className='h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by user or action...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='flex-1'
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className='rounded-lg border px-3 py-2 text-sm dark:bg-slate-800'
              >
                <option value='all'>All Types</option>
                <option value='price change'>Price Changes</option>
                <option value='stock adjustment'>Stock Adjustments</option>
                <option value='discount'>Discounts</option>
                <option value='tax payment'>Tax Payments</option>
              </select>
            </div>

            {/* Audit Log Table */}
            <div className='overflow-hidden rounded-lg border'>
              <table className='w-full text-sm'>
                <thead className='border-b bg-gray-50 dark:bg-slate-700'>
                  <tr>
                    <th className='p-3 text-left font-semibold'>Type</th>
                    <th className='p-3 text-left font-semibold'>Action</th>
                    <th className='p-3 text-left font-semibold'>Changed By</th>
                    <th className='p-3 text-left font-semibold'>Details</th>
                    <th className='p-3 text-left font-semibold'>Timestamp</th>
                    <th className='p-3 text-left font-semibold'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className='border-b hover:bg-gray-50 dark:hover:bg-slate-700'
                    >
                      <td className='p-3'>
                        <Badge variant='outline'>{log.entityType}</Badge>
                      </td>
                      <td className='p-3'>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className='p-3 font-medium'>{log.changedBy}</td>
                      <td className='p-3 text-xs text-muted-foreground'>
                        {log.details}
                      </td>
                      <td className='p-3 text-xs text-muted-foreground'>
                        {log.timestamp}
                      </td>
                      <td className='p-3'>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-7 w-7 p-0'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  No audit logs matching your filters
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className='mt-4 grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-3 dark:bg-slate-800'>
                <p className='text-xs text-muted-foreground'>Total Changes</p>
                <p className='text-2xl font-bold'>{filteredLogs.length}</p>
              </div>
              <div className='rounded-lg bg-white p-3 dark:bg-slate-800'>
                <p className='text-xs text-muted-foreground'>Last 24 Hours</p>
                <p className='text-2xl font-bold'>{filteredLogs.length}</p>
              </div>
              <div className='rounded-lg bg-white p-3 dark:bg-slate-800'>
                <p className='text-xs text-muted-foreground'>Active Users</p>
                <p className='text-2xl font-bold'>4</p>
              </div>
              <div className='rounded-lg bg-white p-3 dark:bg-slate-800'>
                <p className='text-xs text-muted-foreground'>Change Types</p>
                <p className='text-2xl font-bold'>4</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Why Audit Trails Matter</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <p>
            ✓ <strong>Compliance</strong>: Required for financial audits and tax
            purposes
          </p>
          <p>
            ✓ <strong>Accountability</strong>: Know who made every change in
            your system
          </p>
          <p>
            ✓ <strong>Error Recovery</strong>: Trace changes to identify what
            went wrong
          </p>
          <p>
            ✓ <strong>Fraud Prevention</strong>: Detect unusual activity
            patterns
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
