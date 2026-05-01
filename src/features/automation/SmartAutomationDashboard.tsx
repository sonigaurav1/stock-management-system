'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Zap,
  Settings,
  RotateCw,
  Layers3,
  TrendingUp,
  Activity
} from 'lucide-react';
import AutomaticReorderWidget from './AutomaticReorderWidget';
import AutoReconciliationWidget from './AutoReconciliationWidget';
import DuplicateDetectionWidget from './DuplicateDetectionWidget';
import AutoCategorizeWidget from './AutoCategorizeWidget';
import BulkOperationsWidget from './BulkOperationsWidget';

export default function SmartAutomationDashboard() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Zap className='h-8 w-8 text-yellow-500' />
          <h1 className='text-3xl font-bold'>Smart Automation</h1>
        </div>
        <p className='text-gray-600'>
          Automate repetitive tasks, reduce manual work, and improve accuracy
          across your business operations
        </p>
      </div>

      {/* Overview Status Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
        <Card className='border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Auto Reorder
                </p>
                <p className='mt-1 text-2xl font-bold'>5</p>
                <p className='mt-1 text-xs text-gray-500'>Items pending</p>
              </div>
              <Package className='h-8 w-8 text-blue-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Reconciliation
                </p>
                <p className='mt-1 text-2xl font-bold'>89%</p>
                <p className='mt-1 text-xs text-gray-500'>Matched</p>
              </div>
              <RotateCw className='h-8 w-8 text-purple-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-red-200 bg-gradient-to-br from-red-50 to-red-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Duplicates</p>
                <p className='mt-1 text-2xl font-bold'>3</p>
                <p className='mt-1 text-xs text-gray-500'>Detected</p>
              </div>
              <AlertTriangle className='h-8 w-8 text-red-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-green-200 bg-gradient-to-br from-green-50 to-green-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Categorization
                </p>
                <p className='mt-1 text-2xl font-bold'>76%</p>
                <p className='mt-1 text-xs text-gray-500'>Auto-classified</p>
              </div>
              <Layers3 className='h-8 w-8 text-green-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Bulk Ops</p>
                <p className='mt-1 text-2xl font-bold'>847</p>
                <p className='mt-1 text-xs text-gray-500'>Items processed</p>
              </div>
              <Activity className='h-8 w-8 text-orange-600 opacity-20' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue='reorder' className='w-full'>
        <TabsList className='grid w-full grid-cols-5 bg-gray-100 p-1'>
          <TabsTrigger value='reorder' className='flex items-center gap-2'>
            <Package className='h-4 w-4' />
            <span className='hidden sm:inline'>Reorder</span>
          </TabsTrigger>
          <TabsTrigger value='reconcile' className='flex items-center gap-2'>
            <RotateCw className='h-4 w-4' />
            <span className='hidden sm:inline'>Reconcile</span>
          </TabsTrigger>
          <TabsTrigger value='duplicates' className='flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4' />
            <span className='hidden sm:inline'>Duplicates</span>
          </TabsTrigger>
          <TabsTrigger value='categorize' className='flex items-center gap-2'>
            <Layers3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Categorize</span>
          </TabsTrigger>
          <TabsTrigger value='bulk' className='flex items-center gap-2'>
            <Activity className='h-4 w-4' />
            <span className='hidden sm:inline'>Bulk Ops</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='reorder' className='mt-6'>
          <AutomaticReorderWidget />
        </TabsContent>

        <TabsContent value='reconcile' className='mt-6'>
          <AutoReconciliationWidget />
        </TabsContent>

        <TabsContent value='duplicates' className='mt-6'>
          <DuplicateDetectionWidget />
        </TabsContent>

        <TabsContent value='categorize' className='mt-6'>
          <AutoCategorizeWidget />
        </TabsContent>

        <TabsContent value='bulk' className='mt-6'>
          <BulkOperationsWidget />
        </TabsContent>
      </Tabs>

      {/* Automation Rules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Automation Rules Configuration
          </CardTitle>
          <CardDescription>
            Manage automation triggers and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-lg border bg-blue-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <CheckCircle2 className='h-4 w-4 text-blue-600' />
                Stock Below Reorder Level
              </h4>
              <p className='text-sm text-gray-600'>
                Automatically create purchase orders when product stock falls
                below the reorder level
              </p>
            </div>
            <div className='rounded-lg border bg-purple-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <CheckCircle2 className='h-4 w-4 text-purple-600' />
                Unmatched Transactions
              </h4>
              <p className='text-sm text-gray-600'>
                Automatically match bank transactions with invoices and flag
                unmatched items
              </p>
            </div>
            <div className='rounded-lg border bg-red-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <CheckCircle2 className='h-4 w-4 text-red-600' />
                Duplicate Detection
              </h4>
              <p className='text-sm text-gray-600'>
                Identify and prevent duplicate orders, invoices, and
                transactions in real-time
              </p>
            </div>
            <div className='rounded-lg border bg-green-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <CheckCircle2 className='h-4 w-4 text-green-600' />
                Smart Categorization
              </h4>
              <p className='text-sm text-gray-600'>
                Automatically classify transactions based on description
                patterns and keywords
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
