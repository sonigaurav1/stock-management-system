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
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const taxData = [
  { month: 'Jan', tax: 1850 },
  { month: 'Feb', tax: 2100 },
  { month: 'Mar', tax: 1950 },
  { month: 'Apr', tax: 2450 },
  { month: 'May', tax: 2200 },
  { month: 'Jun', tax: 2800 }
];

export function TaxCompliance() {
  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Tax Compliance</CardTitle>
              <CardDescription>
                Automated tax calculations and filing status
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <FileText className='h-4 w-4' />
              View Tax Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Tax Chart */}
            <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Tax Collected Monthly
              </h3>
              <ResponsiveContainer width='100%' height={250}>
                <LineChart data={taxData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='month' stroke='#8b5cf6' />
                  <YAxis stroke='#8b5cf6' />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='tax'
                    stroke='#10b981'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Current Tax Status */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Current Tax Rate
                    </p>
                    <p className='text-3xl font-bold text-green-600'>16%</p>
                  </div>
                  <DollarSign className='h-8 w-8 text-green-600 opacity-20' />
                </div>
                <p className='text-xs text-muted-foreground'>
                  GST/HST registration active
                </p>
              </div>

              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      YTD Tax Collected
                    </p>
                    <p className='text-3xl font-bold text-green-600'>$13,350</p>
                  </div>
                  <CheckCircle className='h-8 w-8 text-green-600 opacity-20' />
                </div>
                <p className='text-xs text-muted-foreground'>
                  6 months collected
                </p>
              </div>
            </div>

            {/* Filing Schedule */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Tax Filing Schedule</h3>
              <div className='space-y-2'>
                <div className='flex items-start gap-3 rounded-lg border bg-white p-4 dark:bg-slate-800'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Q1 2026 Tax Filing</p>
                    <p className='text-xs text-muted-foreground'>
                      Filed on March 15, 2026
                    </p>
                  </div>
                  <Badge className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                    Completed
                  </Badge>
                </div>

                <div className='flex items-start gap-3 rounded-lg border bg-white p-4 dark:bg-slate-800'>
                  <Clock className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Q2 2026 Tax Filing</p>
                    <p className='text-xs text-muted-foreground'>
                      Due June 15, 2026 (45 days remaining)
                    </p>
                  </div>
                  <Badge className='bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'>
                    Upcoming
                  </Badge>
                </div>

                <div className='flex items-start gap-3 rounded-lg border bg-white p-4 dark:bg-slate-800'>
                  <Clock className='mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Q3 2026 Tax Filing</p>
                    <p className='text-xs text-muted-foreground'>
                      Due September 15, 2026
                    </p>
                  </div>
                  <Badge className='bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                    Scheduled
                  </Badge>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900'>
              <h4 className='mb-3 text-sm font-semibold text-green-900 dark:text-green-100'>
                Compliance Checklist
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-green-800 dark:text-green-200'>
                    GST Registration Updated
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-green-800 dark:text-green-200'>
                    Monthly Records Complete
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-green-800 dark:text-green-200'>
                    Input Tax Credits Allocated
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='text-sm text-green-800 dark:text-green-200'>
                    Exemptions Properly Classified
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4 text-yellow-600' />
                  <span className='text-sm text-yellow-800 dark:text-yellow-200'>
                    Documentation Review Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Summary */}
            <div className='grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-3'>
              <div className='flex gap-3'>
                <DollarSign className='h-5 w-5 flex-shrink-0 text-green-600' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Gross Revenue
                  </p>
                  <p className='font-bold'>$83,450</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <DollarSign className='h-5 w-5 flex-shrink-0 text-blue-600' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Taxable Amount
                  </p>
                  <p className='font-bold'>$78,200</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <DollarSign className='h-5 w-5 flex-shrink-0 text-green-600' />
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Tax Payable
                  </p>
                  <p className='font-bold'>$12,512</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Compliance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tax Compliance Tips</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <p>• Keep all invoices and receipts organized for audit purposes</p>
          <p>• Record all business expenses in real-time to ensure accuracy</p>
          <p>• Maintain separate records for taxable and exempt sales</p>
          <p>• Review your tax status quarterly to stay compliant</p>
          <p>• Consult with a tax professional for complex transactions</p>
        </CardContent>
      </Card>
    </div>
  );
}
