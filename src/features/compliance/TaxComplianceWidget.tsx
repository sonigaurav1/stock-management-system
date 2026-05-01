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
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function TaxComplianceWidget() {
  const taxStatus = useQuery(api.compliance.getTaxComplianceStatus, {
    period: 'monthly',
    year: new Date().getFullYear()
  });
  const generateTaxReport = useMutation(api.compliance.generateTaxReport);

  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
      await generateTaxReport({
        startDate: startOfMonth.getTime(),
        endDate: endOfMonth.getTime(),
        reportType: 'monthly'
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (taxStatus === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-green-600' />
      </div>
    );
  }

  const data = taxStatus as any;
  const compliance = data?.compliance || {};
  const summary = data?.summary || {};

  return (
    <div className='space-y-6'>
      {/* Tax Compliance Status */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-green-700'>Tax Status</p>
                <p className='mt-2 flex items-center gap-2 text-lg font-bold text-green-600'>
                  <CheckCircle2 className='h-5 w-5' />
                  Compliant
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Total Sales</p>
            <p className='mt-1 text-2xl font-bold'>
              ₹{(data.totalSales || 0).toLocaleString()}
            </p>
            <p className='mt-1 text-xs text-gray-500'>
              {data.month}/{data.year}
            </p>
          </CardContent>
        </Card>

        <Card className='border-orange-200 bg-orange-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-orange-700'>Tax Due</p>
            <p className='mt-1 text-2xl font-bold text-orange-600'>
              ₹{(data.totalTax || 0).toLocaleString()}
            </p>
            <p className='mt-1 text-xs text-orange-600'>
              @{((data.taxRate || 0) * 100).toFixed(0)}% GST
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Payment Due</p>
            <p className='mt-1 text-lg font-bold'>
              {new Date(data.dueDate).toLocaleDateString()}
            </p>
            <p className='mt-1 text-xs text-gray-500'>
              {Math.ceil((data.dueDate - Date.now()) / (1000 * 60 * 60 * 24))}{' '}
              days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5' />
            Compliance Checklist
          </CardTitle>
          <CardDescription>Tax filing status and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div>
                <p className='font-medium'>
                  {compliance.invoicesIssued || 0} Invoices Issued
                </p>
                <p className='text-sm text-gray-600'>
                  {compliance.invoicesRecorded || 0} recorded in system
                </p>
              </div>
              <Badge variant='default'>
                {(
                  ((compliance.invoicesRecorded || 0) /
                    (compliance.invoicesIssued || 1)) *
                  100
                ).toFixed(0)}
                %
              </Badge>
            </div>

            <div className='flex items-center justify-between rounded-lg bg-green-50 p-3'>
              <div>
                <p className='font-medium'>GST Filing</p>
                <p className='text-sm text-gray-600'>Monthly GST return</p>
              </div>
              <Badge variant='default' className='bg-green-600'>
                Filed
              </Badge>
            </div>

            <div className='flex items-center justify-between rounded-lg bg-blue-50 p-3'>
              <div>
                <p className='font-medium'>Tax Payment</p>
                <p className='text-sm text-gray-600'>Last payment recorded</p>
              </div>
              <Badge variant='outline'>
                {new Date(
                  compliance.lastFiled || Date.now()
                ).toLocaleDateString()}
              </Badge>
            </div>

            <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
              <div>
                <p className='font-medium'>Documents</p>
                <p className='text-sm text-gray-600'>
                  Upload status for this month
                </p>
              </div>
              <Badge variant='default'>
                {compliance.documentsUpload === 'completed'
                  ? 'Complete'
                  : 'In Progress'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Tax Summary
          </CardTitle>
          <CardDescription>
            Financial breakdown for tax calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-lg border p-3'>
                <p className='text-sm text-gray-600'>Gross Revenue</p>
                <p className='mt-1 text-xl font-bold'>
                  ₹{(summary.grossRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-sm text-gray-600'>Taxable Income</p>
                <p className='mt-1 text-xl font-bold'>
                  ₹{(summary.taxableIncome || 0).toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border bg-orange-50 p-3'>
                <p className='text-sm font-medium text-orange-700'>
                  Tax Payable
                </p>
                <p className='mt-1 text-xl font-bold text-orange-600'>
                  ₹{(summary.totalTaxDue || 0).toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border p-3'>
                <p className='text-sm text-gray-600'>Penalties</p>
                <p className='mt-1 text-xl font-bold'>
                  ₹{(summary.penalties || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className='gap-2'
              >
                {generatingReport ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Download className='h-4 w-4' />
                )}
                Generate Tax Report
              </Button>
              <Button variant='outline' className='gap-2'>
                <FileText className='h-4 w-4' />
                View Previous Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Payment Schedule</CardTitle>
          <CardDescription>Upcoming tax payment dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className='text-right'>Amount Due</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className='font-medium'>April 2026</TableCell>
                  <TableCell className='text-right'>
                    ₹{(data.totalTax || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(data.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Upcoming</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='font-medium'>March 2026</TableCell>
                  <TableCell className='text-right'>
                    ₹{(data.totalTax || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      data.dueDate - 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant='default'>Paid</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
