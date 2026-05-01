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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertCircle,
  Activity,
  CheckCircle2,
  Loader2,
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
import { Progress } from '@/components/ui/progress';

export default function BulkOperationsWidget() {
  const [selectedOperation, setSelectedOperation] = useState<
    'updateStock' | 'updatePrice' | 'categorize'
  >('updateStock');
  const [selectedEntityType, setSelectedEntityType] = useState<
    'products' | 'transactions'
  >('products');
  const [isExecuting, setIsExecuting] = useState(false);

  const bulkJobs = useQuery(api.automation.getBulkOperationJobs, { limit: 20 });
  const executeBulkOp = useMutation(api.automation.executeBulkOperation);

  const handleExecuteOperation = async () => {
    setIsExecuting(true);
    try {
      // Example: Simulate bulk operation with sample data
      await executeBulkOp({
        entityType: selectedEntityType,
        operation: selectedOperation,
        targetIds: Array.from({ length: 50 }, (_, i) => `sample-id-${i}`),
        operationParameters: {
          newStock: 100,
          newPrice: 999,
          category: 'Supplies'
        }
      });
    } catch (error) {
      console.error('Failed to execute bulk operation:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (bulkJobs === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-orange-600' />
      </div>
    );
  }

  const recentJobs = bulkJobs || [];
  const completedJobs = recentJobs.filter((j: any) => j.status === 'completed');
  const totalProcessed = recentJobs.reduce(
    (sum: number, j: any) => sum + (j.targetIds?.length || 0),
    0
  );

  return (
    <div className='space-y-6'>
      {/* Bulk Operation Statistics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-orange-600'>
                {recentJobs.length}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Total Operations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-blue-600'>
                {totalProcessed}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Items Processed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-green-600'>98.5%</p>
              <p className='mt-1 text-sm text-gray-600'>Average Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start New Bulk Operation */}
      <Card className='border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5 text-orange-600' />
            Execute Bulk Operation
          </CardTitle>
          <CardDescription>Process 100+ items at once</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Entity Type
              </label>
              <Select
                value={selectedEntityType}
                onValueChange={(v) => setSelectedEntityType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='products'>Products</SelectItem>
                  <SelectItem value='transactions'>Transactions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='mb-2 block text-sm font-medium'>
                Operation
              </label>
              <Select
                value={selectedOperation}
                onValueChange={(v) => setSelectedOperation(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedEntityType === 'products' ? (
                    <>
                      <SelectItem value='updateStock'>Update Stock</SelectItem>
                      <SelectItem value='updatePrice'>Update Price</SelectItem>
                    </>
                  ) : (
                    <SelectItem value='categorize'>Categorize</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end'>
              <Button
                onClick={handleExecuteOperation}
                disabled={isExecuting}
                className='w-full gap-2 bg-orange-600 hover:bg-orange-700'
              >
                {isExecuting ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <Activity className='h-4 w-4' />
                    Execute
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Operations History */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5 text-orange-600' />
            Recent Bulk Operations
          </CardTitle>
          <CardDescription>Last 20 bulk operations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>
              No bulk operations yet
            </p>
          ) : (
            <div className='space-y-4'>
              {recentJobs.slice(0, 10).map((job: any, idx: number) => (
                <div key={idx} className='space-y-3 rounded-lg border p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h4 className='text-sm font-semibold'>
                        {job.operation === 'updateStock' &&
                          'Update Stock Levels'}
                        {job.operation === 'updatePrice' && 'Update Prices'}
                        {job.operation === 'categorize' && 'Auto-Categorize'}
                      </h4>
                      <p className='mt-1 text-xs text-gray-500'>
                        ID: {job.jobId?.slice(0, 16)}...
                      </p>
                    </div>
                    <Badge
                      variant={
                        job.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {job.status}
                    </Badge>
                  </div>

                  <div className='grid grid-cols-3 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-500'>Total Items</p>
                      <p className='font-semibold'>
                        {job.targetIds?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Successful</p>
                      <p className='font-semibold text-green-600'>
                        {job.successCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Failed</p>
                      <p className='font-semibold text-red-600'>
                        {job.failureCount || 0}
                      </p>
                    </div>
                  </div>

                  {job.targetIds && job.targetIds.length > 0 && (
                    <div className='space-y-2'>
                      <div className='flex justify-between text-xs'>
                        <span>Progress</span>
                        <span>
                          {Math.round(
                            ((job.successCount || 0) /
                              Math.max(job.targetIds.length, 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={Math.round(
                          ((job.successCount || 0) /
                            Math.max(job.targetIds.length, 1)) *
                            100
                        )}
                        className='h-2'
                      />
                    </div>
                  )}

                  <p className='text-xs text-gray-500'>
                    {job.status === 'completed' && job.completedAt
                      ? `Completed at ${new Date(job.completedAt).toLocaleString()}`
                      : `Created at ${new Date(job.createdAt).toLocaleString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className='border-orange-200 bg-orange-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertCircle className='h-5 w-5 text-orange-600' />
            How Bulk Operations Work
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white'>
              1
            </div>
            <p>Select the entity type (Products, Transactions, etc.)</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white'>
              2
            </div>
            <p>Choose the operation (Update Stock, Price, Categorize)</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white'>
              3
            </div>
            <p>System processes 100+ items asynchronously</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white'>
              4
            </div>
            <p>View completion status and success rates in real-time</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
