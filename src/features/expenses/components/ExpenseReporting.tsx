'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertCircle,
  Download,
  FileText,
  BarChart,
  DollarSign,
  Calendar
} from 'lucide-react';

export function ExpenseReporting() {
  const [selectedReport, setSelectedReport] = useState('monthly_summary');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split('T')[0].slice(0, 7)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<
    Array<{
      id: string;
      type: string;
      typeLabel: string | undefined;
      format: string;
      period: string;
      generatedAt: Date;
      fileName: string;
    }>
  >([]);

  // Mock report templates
  const reportTypes = [
    {
      id: 'monthly_summary',
      name: 'Monthly Summary',
      description: 'Complete overview of spending by category',
      icon: Calendar
    },
    {
      id: 'category_breakdown',
      name: 'Category Breakdown',
      description: 'Detailed analysis of expenses by category',
      icon: BarChart
    },
    {
      id: 'tax_summary',
      name: 'Tax Summary',
      description: 'Deductible vs non-deductible expense analysis',
      icon: DollarSign
    },
    {
      id: 'cash_flow',
      name: 'Cash Flow Report',
      description: 'Income and expense cash flow analysis',
      icon: DollarSign
    },
    {
      id: 'p&l',
      name: 'Profit & Loss',
      description: 'Complete P&L statement with metrics',
      icon: FileText
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newReport = {
      id: `report-${Date.now()}`,
      type: selectedReport,
      typeLabel: reportTypes.find((r) => r.id === selectedReport)?.name,
      format: selectedFormat,
      period: selectedMonth,
      generatedAt: new Date(),
      fileName: `expense-report-${selectedReport}-${selectedMonth}.${selectedFormat === 'pdf' ? 'pdf' : 'xlsx'}`
    };

    setGeneratedReports((prev) => [newReport, ...prev]);
    setIsGenerating(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (report: any) => {
    // In production, this would fetch the file from the server
    console.debug('Downloading:', report.fileName);
  };

  return (
    <div className='space-y-4'>
      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Generate Reports</CardTitle>
          <CardDescription className='text-xs'>
            Create and export expense reports in multiple formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='templates' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='templates'>Report Templates</TabsTrigger>
              <TabsTrigger value='custom'>Custom Report</TabsTrigger>
              <TabsTrigger value='schedule'>Scheduled</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value='templates' className='space-y-4'>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`cursor-pointer rounded-lg border-2 p-3 transition-colors ${
                        selectedReport === report.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-start gap-2'>
                        <Icon className='mt-1 h-5 w-5 flex-shrink-0 text-gray-600' />
                        <div>
                          <p className='text-sm font-medium'>{report.name}</p>
                          <p className='text-xs text-gray-600'>
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Generate Controls */}
              <div className='space-y-3 rounded-lg border bg-gray-50 p-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='mb-1 block text-xs font-semibold'>
                      Month
                    </label>
                    <input
                      type='month'
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className='w-full rounded border px-3 py-2 text-sm'
                    />
                  </div>
                  <div>
                    <label className='mb-1 block text-xs font-semibold'>
                      Format
                    </label>
                    <Select
                      value={selectedFormat}
                      onValueChange={setSelectedFormat}
                    >
                      <SelectTrigger className='text-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='pdf'>PDF</SelectItem>
                        <SelectItem value='xlsx'>Excel</SelectItem>
                        <SelectItem value='csv'>CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className='w-full'
                >
                  <Download className='mr-2 h-4 w-4' />
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </TabsContent>

            {/* Custom Tab */}
            <TabsContent value='custom'>
              <div className='rounded-lg border bg-gray-50 p-4 text-center text-gray-600'>
                <p className='text-sm'>
                  Create custom reports with selected date ranges and filters
                </p>
                <p className='mt-2 text-xs text-gray-500'>
                  Coming soon - Configure date ranges, categories, and more
                </p>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value='schedule'>
              <div className='rounded-lg border bg-gray-50 p-4 text-center text-gray-600'>
                <p className='text-sm'>
                  Receive automated reports on a schedule
                </p>
                <p className='mt-2 text-xs text-gray-500'>
                  Coming soon - Set up reports to be emailed monthly, quarterly,
                  or yearly
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      {generatedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Recent Reports</CardTitle>
            <CardDescription className='text-xs'>
              {generatedReports.length} report
              {generatedReports.length !== 1 ? 's' : ''} generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {generatedReports.map((report: any) => (
                <div
                  key={report.id}
                  className='flex items-center justify-between rounded-lg border bg-gray-50 p-3 transition-colors hover:bg-gray-100'
                >
                  <div className='flex min-w-0 flex-1 items-start gap-3'>
                    {report.format === 'pdf' ? (
                      <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600' />
                    ) : (
                      <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                    )}

                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-medium'>
                        {report.typeLabel} - {report.period}
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <Badge className='text-xs' variant='outline'>
                          {report.format.toUpperCase()}
                        </Badge>
                        <p className='text-xs text-gray-600'>
                          {formatDate(report.generatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDownload(report)}
                    className='text-blue-600 hover:text-blue-700'
                  >
                    <Download className='mr-1 h-4 w-4' />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report P&L Example */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Sample Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* P&L Statement */}
            <div className='rounded border bg-gray-50 p-4'>
              <p className='mb-3 text-sm font-bold'>
                Profit & Loss Statement - April 2026
              </p>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between font-bold text-blue-600'>
                  <span>REVENUE</span>
                  <span>₹125,000</span>
                </div>
                <div className='ml-4 space-y-1 text-xs'>
                  <div className='flex justify-between'>
                    <span>Sales</span>
                    <span>₹125,000</span>
                  </div>
                </div>

                <div className='mt-2 border-t pt-2' />

                <div className='flex justify-between font-bold text-red-600'>
                  <span>TOTAL EXPENSES</span>
                  <span>₹32,500</span>
                </div>
                <div className='ml-4 space-y-1 text-xs'>
                  <div className='flex justify-between'>
                    <span>Salary & Staff</span>
                    <span>₹8,000</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Utilities & Rent</span>
                    <span>₹3,500</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Supplies</span>
                    <span>₹2,100</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Other Expenses</span>
                    <span>₹18,900</span>
                  </div>
                </div>

                <div className='mt-2 border-t border-gray-300 pt-2' />

                <div className='flex justify-between text-sm font-bold text-green-600'>
                  <span>NET PROFIT</span>
                  <span>₹92,500</span>
                </div>

                <div className='flex justify-between pt-2 text-xs text-gray-600'>
                  <span>Profit Margin</span>
                  <span>74%</span>
                </div>
              </div>
            </div>

            {/* Tax Info */}
            <div className='rounded border border-blue-200 bg-blue-50 p-3'>
              <div className='flex gap-2'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
                <div className='text-xs text-blue-900'>
                  <p>
                    <strong>Deductible Expenses:</strong> ₹22,600 (at 30% tax
                    rate = ₹6,780 savings)
                  </p>
                  <p className='mt-1'>
                    <strong>Non-Deductible:</strong> ₹9,900
                    (personal/non-business)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
