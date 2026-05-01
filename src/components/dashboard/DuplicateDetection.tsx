import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

export function DuplicateDetection() {
  const [selectedEntity, setSelectedEntity] = useState<
    'sales' | 'payments' | 'transactions'
  >('sales');
  const duplicateData = useQuery(api.automation.detectDuplicateRecords, {
    entityType: selectedEntity
  });

  if (duplicateData === undefined) {
    return (
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'>
        <CardHeader>
          <CardTitle>Duplicate Detection</CardTitle>
          <CardDescription>
            Identify and prevent duplicate records
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'>
        <CardHeader>
          <CardTitle>Duplicate Detection System</CardTitle>
          <CardDescription>
            Identify and prevent duplicate orders, invoices, and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Records</p>
                <p className='text-2xl font-bold'>
                  {duplicateData.totalRecords}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-red-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Confirmed Duplicates
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {duplicateData.confirmedDuplicates}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-yellow-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Suspicious</p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {duplicateData.suspiciousDuplicates}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Issues</p>
                <p className='text-2xl font-bold'>
                  {duplicateData.totalIssues}
                </p>
              </div>
            </div>

            {/* Entity Type Selector */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-3 text-sm font-semibold'>
                Check Duplicates For:
              </h3>
              <Tabs
                value={selectedEntity}
                onValueChange={(val) => setSelectedEntity(val as any)}
              >
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='sales'>Sales</TabsTrigger>
                  <TabsTrigger value='payments'>Payments</TabsTrigger>
                  <TabsTrigger value='transactions'>Transactions</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* No Issues Status */}
            {duplicateData.totalIssues === 0 && (
              <div className='flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900'>
                <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-300' />
                <div>
                  <h4 className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    No Duplicates Detected
                  </h4>
                  <p className='mt-1 text-sm text-green-800 dark:text-green-200'>
                    All {selectedEntity} records appear to be unique.
                  </p>
                </div>
              </div>
            )}

            {/* Exact Duplicates */}
            {duplicateData.confirmedDuplicates > 0 && (
              <div className='space-y-3'>
                <h3 className='flex items-center gap-2 text-sm font-semibold'>
                  <Copy className='h-4 w-4' />
                  Exact Duplicates Found: {duplicateData.confirmedDuplicates}
                </h3>
                <div className='max-h-[300px] space-y-2 overflow-y-auto'>
                  {duplicateData.duplicatesList
                    ?.slice(0, 10)
                    .map((dup: any, idx: number) => (
                      <div
                        key={idx}
                        className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium'>
                              Amount: ${dup.amount?.toFixed(2)}
                            </p>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              Customer: {dup.customer} | Time diff:{' '}
                              {dup.timeDiffMinutes?.toFixed(0)} min
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='rounded bg-red-600 px-2 py-1 text-xs text-white'>
                              Confidence: {dup.duplicateScore * 100}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {duplicateData.confirmedDuplicates > 10 && (
                  <p className='text-xs text-muted-foreground'>
                    +{duplicateData.confirmedDuplicates - 10} more duplicates...
                  </p>
                )}
              </div>
            )}

            {/* Suspicious Duplicates */}
            {duplicateData.suspiciousDuplicates > 0 && (
              <div className='space-y-3'>
                <h3 className='flex items-center gap-2 text-sm font-semibold'>
                  <AlertTriangle className='h-4 w-4 text-yellow-600' />
                  Suspicious Duplicates: {duplicateData.suspiciousDuplicates}
                </h3>
                <div className='max-h-[300px] space-y-2 overflow-y-auto'>
                  {duplicateData.suspiciousList
                    ?.slice(0, 10)
                    .map((dup: any, idx: number) => (
                      <div
                        key={idx}
                        className='rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium'>
                              Amount: ${dup.amount?.toFixed(2)}
                            </p>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              Time diff: {dup.timeDiffMinutes?.toFixed(0)} min |
                              Confidence: {dup.duplicateScore * 100}%
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='rounded bg-yellow-600 px-2 py-1 text-xs text-white'>
                              Review
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {duplicateData.suspiciousDuplicates > 10 && (
                  <p className='text-xs text-muted-foreground'>
                    +{duplicateData.suspiciousDuplicates - 10} more suspicious
                    records...
                  </p>
                )}
              </div>
            )}

            {/* Summary Statistics */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>Confirmed</p>
                <p className='text-2xl font-bold text-red-600'>
                  {duplicateData.summary?.confirmed || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Needs Review
                </p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {duplicateData.summary?.needsReview || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Est. Impact
                </p>
                <p className='text-lg font-bold'>
                  ${duplicateData.summary?.estimatedFinancialImpact}
                </p>
              </div>
            </div>

            {/* Prevention Features */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h4 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Prevention Features
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>• Exact match detection (same amount, customer, date)</li>
                <li>• Close match detection (within 3% amount, 3 days)</li>
                <li>• Time-based duplicate detection (within 1 hour)</li>
                <li>• Automated flagging with confidence scores</li>
                <li>• Manual review workflow for suspicious records</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
