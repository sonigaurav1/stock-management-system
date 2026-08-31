'use client';

import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import NotFound from '@/app/not-found';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  BarChart3,
  Database,
  Trash2,
  Play,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DemoDataPage() {
  // Redirect to 404 in production
  if (process.env.NODE_ENV === 'production') {
    return <NotFound />;
  }

  const createDemoData = useMutation(
    api.admin.createDemoDashboardData || (() => {})
  );
  const clearDemoData = useMutation(
    api.admin.clearDemoDashboardData || (() => {})
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  interface DemoScenario {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    data: {
      customerCount: number;
      lastMonthCustomerCount?: number;
      revenueAmount: number;
      lastMonthRevenue?: number;
      productCount: number;
      salesRecords: number;
    };
    color: string;
  }

  const scenarios: DemoScenario[] = [
    {
      id: 'normal',
      name: 'Normal Data',
      description: 'Standard baseline metrics for testing',
      icon: <BarChart3 className='h-4 w-4' />,
      data: {
        customerCount: 150,
        lastMonthCustomerCount: 145,
        revenueAmount: 125000,
        lastMonthRevenue: 120000,
        productCount: 45,
        salesRecords: 120
      },
      color: 'bg-blue-500'
    },
    {
      id: 'growth',
      name: 'Growth Trend',
      description: 'Positive growth indicators (+50%)',
      icon: <TrendingUp className='h-4 w-4 text-green-600' />,
      data: {
        customerCount: 300,
        lastMonthCustomerCount: 200,
        revenueAmount: 180000,
        lastMonthRevenue: 120000,
        productCount: 75,
        salesRecords: 250
      },
      color: 'bg-green-500'
    },
    {
      id: 'decline',
      name: 'Declining Trend',
      description: 'Negative growth indicators (-30%)',
      icon: <TrendingDown className='h-4 w-4 text-red-600' />,
      data: {
        customerCount: 100,
        lastMonthCustomerCount: 150,
        revenueAmount: 84000,
        lastMonthRevenue: 120000,
        productCount: 30,
        salesRecords: 80
      },
      color: 'bg-red-500'
    },
    {
      id: 'empty',
      name: 'Empty State',
      description: 'Test with no data',
      icon: <AlertCircle className='h-4 w-4 text-yellow-600' />,
      data: {
        customerCount: 0,
        revenueAmount: 0,
        productCount: 0,
        salesRecords: 0
      },
      color: 'bg-yellow-500'
    },
    {
      id: 'large',
      name: 'Large Scale',
      description: 'High volume data testing',
      icon: <Database className='h-4 w-4 text-purple-600' />,
      data: {
        customerCount: 5000,
        lastMonthCustomerCount: 4800,
        revenueAmount: 2500000,
        lastMonthRevenue: 2350000,
        productCount: 500,
        salesRecords: 10000
      },
      color: 'bg-purple-500'
    }
  ];

  const handleCreateData = async (scenario: DemoScenario) => {
    setIsLoading(true);
    setSelectedScenario(scenario.id);
    try {
      await createDemoData({
        ...scenario.data,
        scenarioName: scenario.name
      });
      toast.success(`Demo data created: ${scenario.name}`);
    } catch (error) {
      console.error('Error creating demo data:', error);
      toast.error('Failed to create demo data. Ensure mutation is exported.');
    } finally {
      setIsLoading(false);
      setSelectedScenario(null);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    const tables = ['customers', 'products', 'sales'] as const;
    let totalDeleted = 0;

    try {
      for (const table of tables) {
        let hasMore = true;
        let tableDeleted = 0;

        while (hasMore) {
          const result = await clearDemoData({ table });
          tableDeleted += result.deletedCount;
          totalDeleted += result.deletedCount;
          hasMore = result.hasMore;

          // Small delay to avoid rate limiting
          if (hasMore) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        console.log(`[DemoData] Cleared ${tableDeleted} from ${table}`);
      }

      toast.success(
        `Demo data cleared! Deleted ${totalDeleted} records total.`
      );
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing demo data:', error);
      toast.error('Failed to clear demo data. Ensure mutation is exported.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <PageContainer>
      <div className='space-y-8'>
        {/* Header */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Database className='h-8 w-8 text-primary' />
            <h1 className='text-3xl font-bold'>Dashboard Demo Data Seeder</h1>
          </div>
          <p className='text-muted-foreground'>
            Inject demo data to test dashboard metrics. Available in development
            mode only.
          </p>
          <Badge variant='secondary' className='mt-2'>
            Development Only
          </Badge>
        </div>

        {/* Info Card */}
        <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <h3 className='font-semibold text-blue-900 dark:text-blue-100'>
                ℹ️ How to Use
              </h3>
              <ul className='list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>Select a test scenario below</li>
                <li>Click "Create Demo Data" to inject sample data</li>
                <li>
                  Visit{' '}
                  <code className='rounded bg-blue-100 px-2 py-1 dark:bg-blue-900'>
                    /dashboard/overview
                  </code>{' '}
                  to see metrics
                </li>
                <li>Use "Clear All Demo Data" to reset when done</li>
                <li>Check Convex Data Browser to verify data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold'>Test Scenarios</h2>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {scenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className='transition-shadow hover:shadow-lg'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='flex items-center gap-2'>
                        {scenario.icon}
                        {scenario.name}
                      </CardTitle>
                      <p className='text-sm text-muted-foreground'>
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Data Summary */}
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span>Customers:</span>
                      <span className='font-semibold'>
                        {scenario.data.customerCount}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Revenue:</span>
                      <span className='font-semibold'>
                        ${scenario.data.revenueAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Products:</span>
                      <span className='font-semibold'>
                        {scenario.data.productCount}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Sales Records:</span>
                      <span className='font-semibold'>
                        {scenario.data.salesRecords}
                      </span>
                    </div>
                  </div>

                  {/* Create Button */}
                  <Button
                    onClick={() => handleCreateData(scenario)}
                    disabled={isLoading && selectedScenario === scenario.id}
                    className='w-full'
                    variant='outline'
                  >
                    <Play className='mr-2 h-4 w-4' />
                    {isLoading && selectedScenario === scenario.id
                      ? 'Creating...'
                      : 'Create Demo Data'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Metric Testing Guide</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div>
                <h4 className='mb-1 text-sm font-semibold'>
                  Key Metrics to Test
                </h4>
                <ul className='list-inside list-disc space-y-1 text-sm text-muted-foreground'>
                  <li>Active Customers count and month-over-month change</li>
                  <li>Revenue total and percentage comparison</li>
                  <li>Product inventory levels and trends</li>
                  <li>Sales performance and analytics</li>
                </ul>
              </div>
              <div>
                <h4 className='mb-1 text-sm font-semibold'>What to Verify</h4>
                <ul className='list-inside list-disc space-y-1 text-sm text-muted-foreground'>
                  <li>Metrics display with correct formatting</li>
                  <li>Percentage changes show +/- indicators</li>
                  <li>Colors change based on positive/negative trends</li>
                  <li>Charts render with sufficient data points</li>
                  <li>
                    Edge cases (empty data, large values) display correctly
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clear Data Section */}
        <Card className='border-red-200 dark:border-red-800'>
          <CardHeader>
            <CardTitle className='text-red-600'>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4 text-sm text-muted-foreground'>
              Clear all demo data. This cannot be undone.
            </p>
            <Button
              onClick={() => setShowClearDialog(true)}
              variant='destructive'
              disabled={isClearing}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {isClearing ? 'Clearing...' : 'Clear All Demo Data'}
            </Button>
          </CardContent>
        </Card>

        {/* Clear Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Demo Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all demo data that was injected. This action
                cannot be undone. Make sure you have finished testing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className='flex justify-end gap-2'>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className='bg-red-600 hover:bg-red-700'
              >
                Clear Data
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
