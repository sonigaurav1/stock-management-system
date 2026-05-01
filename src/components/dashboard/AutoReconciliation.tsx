import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export function AutoReconciliation() {
  const reconciliationData = useQuery(
    api.automation.matchTransactionsWithInvoices,
    {}
  );

  if (reconciliationData === undefined) {
    return (
      <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'>
        <CardHeader>
          <CardTitle>Auto-Reconciliation</CardTitle>
          <CardDescription>
            Bank transaction matching and reconciliation
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const reconciliationChart = [
    {
      name: 'Exact Matches',
      value: reconciliationData.exactMatches,
      fill: '#10b981'
    },
    {
      name: 'Close Matches',
      value: reconciliationData.closeMatches,
      fill: '#f59e0b'
    },
    { name: 'Unmatched', value: reconciliationData.unmatched, fill: '#ef4444' }
  ];

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'>
        <CardHeader>
          <CardTitle>Auto-Reconciliation System</CardTitle>
          <CardDescription>
            Automatically match transactions with invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Total Transactions
                </p>
                <p className='text-2xl font-bold'>
                  {reconciliationData.exactMatches +
                    reconciliationData.closeMatches +
                    reconciliationData.unmatched}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-green-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Exact Matches</p>
                <p className='text-2xl font-bold text-green-600'>
                  {reconciliationData.exactMatches}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-yellow-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Close Matches</p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {reconciliationData.closeMatches}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Reconciliation Rate
                </p>
                <p className='text-2xl font-bold'>
                  {reconciliationData.reconciliationRate}%
                </p>
              </div>
            </div>

            {/* Reconciliation Status Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Reconciliation Status
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={reconciliationChart}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#8884d8' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Exact Matches */}
            {reconciliationData.exactMatches > 0 && (
              <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900'>
                <div className='flex items-start gap-3'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-300' />
                  <div className='flex-1'>
                    <h4 className='font-semibold text-green-900 dark:text-green-100'>
                      Perfect Matches Found
                    </h4>
                    <p className='mt-1 text-sm text-green-800 dark:text-green-200'>
                      {reconciliationData.exactMatches} transactions matched
                      exactly with invoices
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Close Matches */}
            {reconciliationData.closeMatches > 0 && (
              <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900'>
                <h4 className='mb-3 text-sm font-semibold text-yellow-900 dark:text-yellow-100'>
                  Close Matches - Review Needed
                </h4>
                <div className='max-h-[300px] space-y-2 overflow-y-auto'>
                  {reconciliationData.closeMatchesList
                    ?.slice(0, 5)
                    .map((match: any, idx: number) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between rounded bg-white p-2 text-xs dark:bg-slate-800'
                      >
                        <span>${match.transactionAmount?.toFixed(2)}</span>
                        <ArrowRight className='h-3 w-3' />
                        <span>${match.paymentAmount?.toFixed(2)}</span>
                        <span className='ml-auto text-yellow-600'>
                          {match.amountDiffPercent?.toFixed(1)}% diff
                        </span>
                      </div>
                    ))}
                </div>
                {reconciliationData.closeMatches > 5 && (
                  <p className='mt-2 text-xs text-yellow-700 dark:text-yellow-300'>
                    +{reconciliationData.closeMatches - 5} more matches...
                  </p>
                )}
              </div>
            )}

            {/* Unmatched */}
            {reconciliationData.unmatched > 0 && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300' />
                  <div className='flex-1'>
                    <h4 className='font-semibold text-red-900 dark:text-red-100'>
                      Unmatched Records
                    </h4>
                    <p className='mt-1 text-sm text-red-800 dark:text-red-200'>
                      {reconciliationData.unmatched} transactions require manual
                      reconciliation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reconciliation Summary */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Fully Reconciled
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {reconciliationData.summary?.fullyReconciled || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Partial Matches
                </p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {reconciliationData.summary?.partialMatches || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Attention Needed
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {reconciliationData.summary?.requiresAttention || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
