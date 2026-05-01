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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Download, Play, ArrowRight, Clock, Database } from 'lucide-react';
import { useState } from 'react';

const mockReportData = [
  { month: 'Jan', sales: 45000, transactions: 320, revenue: 95000 },
  { month: 'Feb', sales: 52000, transactions: 380, revenue: 110000 },
  { month: 'Mar', sales: 48000, transactions: 350, revenue: 105000 },
  { month: 'Apr', sales: 61000, transactions: 420, revenue: 135000 },
  { month: 'May', sales: 55000, transactions: 390, revenue: 120000 }
];

const mockDetailData = [
  {
    id: 1,
    date: '2024-02-01',
    product: 'Laptop',
    amount: 1500,
    quantity: 2,
    status: 'Completed'
  },
  {
    id: 2,
    date: '2024-02-02',
    product: 'Mouse',
    amount: 250,
    quantity: 5,
    status: 'Completed'
  },
  {
    id: 3,
    date: '2024-02-03',
    product: 'Keyboard',
    amount: 800,
    quantity: 4,
    status: 'Pending'
  },
  {
    id: 4,
    date: '2024-02-04',
    product: 'Monitor',
    amount: 2500,
    quantity: 1,
    status: 'Completed'
  }
];

const executionHistory = [
  { time: 'Today 2:30 PM', duration: '2.3s', rows: 1250 },
  { time: 'Yesterday 2:30 PM', duration: '2.1s', rows: 1180 },
  { time: 'Feb 26, 2:30 PM', duration: '2.4s', rows: 1320 }
];

export function ReportExecution() {
  const [isPending, setIsPending] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [drilldownField, setDrilldownField] = useState<string | null>(null);

  const handleExecute = () => {
    setIsPending(true);
    setTimeout(() => setIsPending(false), 1000);
  };

  return (
    <div className='space-y-4'>
      {/* Execution Control */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Report Execution</CardTitle>
              <CardDescription>
                Run reports and view results with drill-down capability
              </CardDescription>
            </div>
            <Button
              onClick={handleExecute}
              disabled={isPending}
              className='gap-2'
            >
              <Play className='h-4 w-4' />
              {isPending ? 'Executing...' : 'Execute Report'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900'>
              <p className='text-sm text-muted-foreground'>Data Source</p>
              <p className='text-lg font-semibold'>Sales</p>
            </div>
            <div className='rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900'>
              <p className='text-sm text-muted-foreground'>Total Records</p>
              <p className='text-lg font-semibold'>1,250</p>
            </div>
            <div className='rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-900'>
              <p className='text-sm text-muted-foreground'>Execution Time</p>
              <p className='text-lg font-semibold'>2.3s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart View */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Summary Chart</CardTitle>
              <CardDescription>
                Visual representation of your report data
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={showChart ? 'default' : 'outline'}
                onClick={() => setShowChart(true)}
              >
                Chart
              </Button>
              <Button
                size='sm'
                variant={!showChart ? 'default' : 'outline'}
                onClick={() => setShowChart(false)}
              >
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showChart ? (
            <div className='h-64 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={mockReportData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='sales' fill='#3b82f6' />
                  <Bar dataKey='revenue' fill='#10b981' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className='w-full overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='border-b'>
                  <tr>
                    <th className='p-2 text-left'>Month</th>
                    <th className='p-2 text-left'>Sales</th>
                    <th className='p-2 text-left'>Transactions</th>
                    <th className='p-2 text-left'>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReportData.map((row) => (
                    <tr
                      key={row.month}
                      className='cursor-pointer border-b hover:bg-gray-50 dark:hover:bg-slate-700'
                    >
                      <td className='p-2'>{row.month}</td>
                      <td className='p-2'>${row.sales.toLocaleString()}</td>
                      <td className='p-2'>{row.transactions}</td>
                      <td className='p-2 font-semibold'>
                        ${row.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drill-Down Section */}
      <Card>
        <CardHeader>
          <CardTitle>Drill-Down Details</CardTitle>
          <CardDescription>
            Click on summary items to view detailed records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            {drilldownField && (
              <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900'>
                <Database className='h-4 w-4 text-blue-600' />
                <span className='text-sm text-blue-900 dark:text-blue-100'>
                  Showing details for:{' '}
                  <span className='font-semibold'>{drilldownField}</span>
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => setDrilldownField(null)}
                  className='ml-auto h-6'
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <div className='w-full overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='border-b bg-gray-50 dark:bg-slate-700'>
                <tr>
                  <th className='p-2 text-left'>Date</th>
                  <th className='p-2 text-left'>Product</th>
                  <th className='p-2 text-left'>Amount</th>
                  <th className='p-2 text-left'>Quantity</th>
                  <th className='p-2 text-left'>Status</th>
                  <th className='p-2 text-left'>Action</th>
                </tr>
              </thead>
              <tbody>
                {mockDetailData.map((row) => (
                  <tr
                    key={row.id}
                    className='border-b hover:bg-gray-50 dark:hover:bg-slate-700'
                  >
                    <td className='p-2 text-muted-foreground'>{row.date}</td>
                    <td className='p-2 font-medium'>{row.product}</td>
                    <td className='p-2'>${row.amount.toLocaleString()}</td>
                    <td className='p-2'>{row.quantity}</td>
                    <td className='p-2'>
                      <Badge
                        className={
                          row.status === 'Completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className='p-2'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() =>
                          setDrilldownField(`${row.product} - ${row.date}`)
                        }
                        className='h-6 gap-1'
                      >
                        <ArrowRight className='h-3 w-3' />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className='mt-3 text-xs text-muted-foreground'>
            Total records shown: {mockDetailData.length}
          </p>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Recent report runs and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {executionHistory.map((exec, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <Clock className='h-4 w-4 text-blue-500' />
                  <div>
                    <p className='text-sm font-medium'>{exec.time}</p>
                    <p className='text-xs text-muted-foreground'>
                      {exec.rows} rows processed
                    </p>
                  </div>
                </div>
                <div className='text-sm text-muted-foreground'>
                  {exec.duration}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className='flex gap-2'>
        <Button className='flex-1 gap-2' variant='default'>
          <Download className='h-4 w-4' />
          Export Results
        </Button>
        <Button className='flex-1' variant='outline'>
          Save as Template
        </Button>
      </div>
    </div>
  );
}
