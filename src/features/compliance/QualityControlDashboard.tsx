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
  Clock,
  ClipboardList,
  DollarSign,
  Percent,
  FileText,
  Shield,
  AlertCircle
} from 'lucide-react';
import AuditTrailWidget from './AuditTrailWidget';
import InventoryReconciliationWidget from './InventoryReconciliationWidget';
import PriceChangeApprovalWidget from './PriceChangeApprovalWidget';
import DiscountAuditWidget from './DiscountAuditWidget';
import TaxComplianceWidget from './TaxComplianceWidget';

export default function QualityControlDashboard() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Shield className='h-8 w-8 text-purple-500' />
          <h1 className='text-3xl font-bold'>Quality Control & Compliance</h1>
        </div>
        <p className='text-gray-600'>
          Complete audit trail, inventory reconciliation, price approvals,
          discount tracking, and tax compliance
        </p>
      </div>

      {/* Overview Status Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
        <Card className='border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Audit Events
                </p>
                <p className='mt-1 text-2xl font-bold'>234</p>
                <p className='mt-1 text-xs text-gray-500'>Last 30 days</p>
              </div>
              <Clock className='h-8 w-8 text-purple-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Reconciliations
                </p>
                <p className='mt-1 text-2xl font-bold'>18</p>
                <p className='mt-1 text-xs text-gray-500'>Flagged for review</p>
              </div>
              <ClipboardList className='h-8 w-8 text-blue-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  Price Changes
                </p>
                <p className='mt-1 text-2xl font-bold'>7</p>
                <p className='mt-1 text-xs text-gray-500'>Pending approval</p>
              </div>
              <DollarSign className='h-8 w-8 text-orange-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-red-200 bg-gradient-to-br from-red-50 to-red-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>
                  High Discounts
                </p>
                <p className='mt-1 text-2xl font-bold'>₹12.5K</p>
                <p className='mt-1 text-xs text-gray-500'>This month</p>
              </div>
              <Percent className='h-8 w-8 text-red-600 opacity-20' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-green-200 bg-gradient-to-br from-green-50 to-green-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Tax Status</p>
                <p className='mt-1 text-2xl font-bold'>Compliant</p>
                <p className='mt-1 text-xs text-gray-500'>
                  All filings current
                </p>
              </div>
              <FileText className='h-8 w-8 text-green-600 opacity-20' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue='audit' className='w-full'>
        <TabsList className='grid w-full grid-cols-5 bg-gray-100 p-1'>
          <TabsTrigger value='audit' className='flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            <span className='hidden sm:inline'>Audit Trail</span>
          </TabsTrigger>
          <TabsTrigger
            value='reconciliation'
            className='flex items-center gap-2'
          >
            <ClipboardList className='h-4 w-4' />
            <span className='hidden sm:inline'>Reconciliation</span>
          </TabsTrigger>
          <TabsTrigger value='pricing' className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4' />
            <span className='hidden sm:inline'>Price Approvals</span>
          </TabsTrigger>
          <TabsTrigger value='discounts' className='flex items-center gap-2'>
            <Percent className='h-4 w-4' />
            <span className='hidden sm:inline'>Discount Audit</span>
          </TabsTrigger>
          <TabsTrigger value='tax' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            <span className='hidden sm:inline'>Tax Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='audit' className='mt-6'>
          <AuditTrailWidget />
        </TabsContent>

        <TabsContent value='reconciliation' className='mt-6'>
          <InventoryReconciliationWidget />
        </TabsContent>

        <TabsContent value='pricing' className='mt-6'>
          <PriceChangeApprovalWidget />
        </TabsContent>

        <TabsContent value='discounts' className='mt-6'>
          <DiscountAuditWidget />
        </TabsContent>

        <TabsContent value='tax' className='mt-6'>
          <TaxComplianceWidget />
        </TabsContent>
      </Tabs>

      {/* Compliance Standards Reference */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Compliance Standards
          </CardTitle>
          <CardDescription>
            Quality control and compliance best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-lg border bg-purple-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <Clock className='h-4 w-4 text-purple-600' />
                Complete Audit Trail
              </h4>
              <p className='text-sm text-gray-600'>
                Track every change with who made it, when, and why. Maintain
                compliance with regulatory requirements.
              </p>
            </div>
            <div className='rounded-lg border bg-blue-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <ClipboardList className='h-4 w-4 text-blue-600' />
                Inventory Reconciliation
              </h4>
              <p className='text-sm text-gray-600'>
                Record physical counts and compare with system quantities.
                Identify and investigate variance.
              </p>
            </div>
            <div className='rounded-lg border bg-orange-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <DollarSign className='h-4 w-4 text-orange-600' />
                Price Change Approvals
              </h4>
              <p className='text-sm text-gray-600'>
                Require approval for significant price changes to maintain
                pricing strategy and margin control.
              </p>
            </div>
            <div className='rounded-lg border bg-red-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <Percent className='h-4 w-4 text-red-600' />
                Discount Audit
              </h4>
              <p className='text-sm text-gray-600'>
                Monitor all discounts given with approval workflows for
                high-value discounts above thresholds.
              </p>
            </div>
            <div className='rounded-lg border bg-green-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <FileText className='h-4 w-4 text-green-600' />
                Tax Compliance
              </h4>
              <p className='text-sm text-gray-600'>
                Generate tax reports, track payments, and maintain compliance
                with tax regulations.
              </p>
            </div>
            <div className='rounded-lg border bg-gray-50 p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <AlertCircle className='h-4 w-4 text-gray-600' />
                Compliance Alerts
              </h4>
              <p className='text-sm text-gray-600'>
                Real-time alerts for compliance issues, thresholds, and action
                items requiring attention.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
