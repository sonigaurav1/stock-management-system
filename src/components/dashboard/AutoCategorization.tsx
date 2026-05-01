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
  ResponsiveContainer
} from 'recharts';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

export function AutoCategorization() {
  const categorizationData = useQuery(
    api.automation.suggestTransactionCategories,
    {}
  );

  if (categorizationData === undefined) {
    return (
      <Card className='bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950'>
        <CardHeader>
          <CardTitle>Auto-Categorization</CardTitle>
          <CardDescription>
            Automatic transaction classification
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const confidenceBreakdown = [
    {
      name: 'High (>80%)',
      value: categorizationData.summary?.highConfidence || 0,
      fill: '#10b981'
    },
    {
      name: 'Medium (50-80%)',
      value: categorizationData.summary?.mediumConfidence || 0,
      fill: '#f59e0b'
    },
    {
      name: 'Low (<50%)',
      value: categorizationData.summary?.lowConfidence || 0,
      fill: '#ef4444'
    }
  ];

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950'>
        <CardHeader>
          <CardTitle>Automatic Categorization Engine</CardTitle>
          <CardDescription>
            AI-powered transaction classification and organization
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
                  {categorizationData.totalTransactions}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-green-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Suggested</p>
                <p className='text-2xl font-bold text-green-600'>
                  {categorizationData.suggestedCount}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-red-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Uncategorized</p>
                <p className='text-2xl font-bold text-red-600'>
                  {categorizationData.uncategorizedCount}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Automation Ready
                </p>
                <p className='text-2xl font-bold'>
                  {categorizationData.automationReadiness}%
                </p>
              </div>
            </div>

            {/* Confidence Level Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Confidence Distribution
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={confidenceBreakdown}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#8884d8' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* High Confidence Suggestions */}
            {categorizationData.summary?.highConfidence > 0 && (
              <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900'>
                <div className='mb-3 flex items-start gap-3'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-300' />
                  <div>
                    <h4 className='font-semibold text-green-900 dark:text-green-100'>
                      High Confidence Suggestions
                    </h4>
                    <p className='mt-1 text-sm text-green-800 dark:text-green-200'>
                      {categorizationData.summary?.highConfidence} transactions
                      ready for auto-categorization
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Medium Confidence */}
            {categorizationData.summary?.mediumConfidence > 0 && (
              <div className='space-y-3'>
                <h3 className='flex items-center gap-2 text-sm font-semibold'>
                  <AlertCircle className='h-4 w-4 text-yellow-600' />
                  Medium Confidence (
                  {categorizationData.summary?.mediumConfidence})
                </h3>
                <div className='max-h-[300px] space-y-2 overflow-y-auto'>
                  {categorizationData.suggestions
                    ?.filter(
                      (s: any) => s.confidence > 50 && s.confidence <= 80
                    )
                    .slice(0, 8)
                    .map((suggestion: any, idx: number) => (
                      <div
                        key={idx}
                        className='rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <p className='truncate text-xs text-muted-foreground'>
                              {suggestion.description}
                            </p>
                            <p className='mt-1 text-sm font-medium'>
                              ${suggestion.amount?.toFixed(2)}
                            </p>
                          </div>
                          <div className='ml-4 text-right'>
                            <p className='rounded bg-yellow-600 px-2 py-1 text-xs text-white'>
                              {suggestion.suggestedCategory}
                            </p>
                            <p className='mt-1 text-xs text-yellow-700 dark:text-yellow-300'>
                              {suggestion.confidence}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Uncategorized */}
            {categorizationData.uncategorizedCount > 0 && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300' />
                  <div>
                    <h4 className='font-semibold text-red-900 dark:text-red-100'>
                      Requires Manual Review
                    </h4>
                    <p className='mt-1 text-sm text-red-800 dark:text-red-200'>
                      {categorizationData.uncategorizedCount} transactions need
                      manual categorization
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Categories */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Expected Categories
              </h3>
              <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                {[
                  'Supplies',
                  'Marketing',
                  'Utilities',
                  'Salary',
                  'Travel',
                  'Rent',
                  'Maintenance'
                ].map((cat) => (
                  <div
                    key={cat}
                    className='rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 p-3 dark:from-indigo-900 dark:to-purple-900'
                  >
                    <p className='text-sm font-medium text-indigo-900 dark:text-indigo-100'>
                      {cat}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Automation Features */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                <Zap className='h-4 w-4' />
                Automation Capabilities
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>• Pattern-based categorization (keyword matching)</li>
                <li>• Confidence scoring with learning</li>
                <li>• Batch auto-categorization (high confidence only)</li>
                <li>• Manual override & feedback</li>
                <li>• Category suggestions based on description</li>
              </ul>
            </div>

            {/* Action Stats */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  High Confidence
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {categorizationData.summary?.highConfidence || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Medium Confidence
                </p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {categorizationData.summary?.mediumConfidence || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Low Confidence
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {categorizationData.summary?.lowConfidence || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
