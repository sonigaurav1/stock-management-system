'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface ProfitabilityWidgetProps {
  data?: {
    totalRevenue?: number;
    totalExpenses?: number;
    businessExpenses?: number;
    personalExpenses?: number;
    [key: string]: any;
  };
}

export function ProfitabilityWidget({ data }: ProfitabilityWidgetProps) {
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);
  const [year, month] = currentMonth.split('-');

  const startOfMonth = new Date(`${year}-${month}-01`).getTime();
  let endOfMonth = new Date(`${year}-${month}-01`);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  const endOfMonthTime = endOfMonth.getTime();

  // Get expense metrics
  const expenseMetrics = useQuery(api.expenses.getExpenseMetrics, {
    startDate: startOfMonth,
    endDate: endOfMonthTime
  });

  // Calculate profitability
  const totalRevenue = data?.totalRevenue || 125000; // Mock data from dashboard
  const totalExpenses = expenseMetrics?.totalExpenses || 0;
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const businessOnly = totalRevenue - (expenseMetrics?.businessExpenses || 0);

  // Trend data (mock for now)
  const trendData = [
    {
      week: 'Week 1',
      revenue: 30000,
      expenses: 5000,
      profit: 25000
    },
    {
      week: 'Week 2',
      revenue: 32000,
      expenses: 6500,
      profit: 25500
    },
    {
      week: 'Week 3',
      revenue: 31000,
      expenses: 5200,
      profit: 25800
    },
    {
      week: 'Week 4',
      revenue: 32000,
      expenses: 8300,
      profit: 23700
    }
  ];

  const getProfitColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 20) return 'text-blue-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitBgColor = (margin: number) => {
    if (margin >= 30) return 'bg-green-50 border-green-200';
    if (margin >= 20) return 'bg-blue-50 border-blue-200';
    if (margin >= 10) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className='space-y-4'>
      {/* Main Profitability Card */}
      <Card className={`border-2 ${getProfitBgColor(profitMargin)}`}>
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle className='text-base'>Monthly Profitability</CardTitle>
              <CardDescription className='text-xs'>
                Revenue minus all expenses
              </CardDescription>
            </div>
            <DollarSign className={`h-6 w-6 ${getProfitColor(profitMargin)}`} />
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Profit Display */}
          <div>
            <div className='flex items-baseline gap-2'>
              <span
                className={`text-3xl font-bold ${getProfitColor(profitMargin)}`}
              >
                {formatCurrency(profit)}
              </span>
              <span
                className={`text-lg font-semibold ${getProfitColor(profitMargin)}`}
              >
                ({profitMargin.toFixed(1)}%)
              </span>
            </div>
            <p className='mt-1 text-xs text-gray-600'>
              After expenses this period
            </p>
          </div>

          {/* Metrics Grid */}
          <div className='grid grid-cols-3 gap-2'>
            <div className='rounded border bg-white p-2'>
              <p className='text-xs text-gray-600'>Revenue</p>
              <p className='text-sm font-bold text-blue-600'>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className='rounded border bg-white p-2'>
              <p className='text-xs text-gray-600'>Expenses</p>
              <p className='text-sm font-bold text-orange-600'>
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className='rounded border bg-white p-2'>
              <p className='text-xs text-gray-600'>Margin</p>
              <p
                className={`text-sm font-bold ${getProfitColor(profitMargin)}`}
              >
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className='space-y-2 border-t pt-3'>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-600'>Business Expenses</span>
              <span className='font-semibold'>
                {formatCurrency(expenseMetrics?.businessExpenses || 0)}
              </span>
            </div>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-600'>Personal (Reimbursable)</span>
              <span className='font-semibold'>
                {formatCurrency(expenseMetrics?.personalExpenses || 0)}
              </span>
            </div>
            <div className='flex justify-between border-t pt-2 text-xs font-bold'>
              <span>Total</span>
              <span>{formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          {/* Health Indicator */}
          <div className='flex items-center gap-2 rounded bg-white p-2'>
            {profitMargin >= 30 ? (
              <>
                <TrendingUp className='h-4 w-4 text-green-600' />
                <span className='text-xs font-medium text-green-600'>
                  Profitable - Strong margin
                </span>
              </>
            ) : profitMargin >= 15 ? (
              <>
                <TrendingUp className='h-4 w-4 text-blue-600' />
                <span className='text-xs font-medium text-blue-600'>
                  Healthy - Good performance
                </span>
              </>
            ) : (
              <>
                <AlertCircle className='h-4 w-4 text-yellow-600' />
                <span className='text-xs font-medium text-yellow-600'>
                  Watch expenses - Tight margins
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Weekly Breakdown</CardTitle>
          <CardDescription className='text-xs'>
            Revenue, expenses, and profit by week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={250}>
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.1} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis
                dataKey='week'
                stroke='#6b7280'
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke='#6b7280' style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => formatCurrency(value as number)}
              />
              <Legend />
              <Area
                type='monotone'
                dataKey='profit'
                stroke='#10b981'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#colorProfit)'
                name='Profit'
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Expense Categories</CardTitle>
          <CardDescription className='text-xs'>
            Top expense categories this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[
              { name: 'Salary & Staff', amount: 8000, pct: 53 },
              { name: 'Utilities & Rent', amount: 3500, pct: 23 },
              { name: 'Supplies', amount: 2100, pct: 14 },
              { name: 'Marketing', amount: 1400, pct: 10 }
            ].map((cat) => (
              <div key={cat.name} className='space-y-1'>
                <div className='flex justify-between text-xs'>
                  <span className='font-medium'>{cat.name}</span>
                  <span className='text-gray-600'>
                    {formatCurrency(cat.amount)} ({cat.pct}%)
                  </span>
                </div>
                <div className='h-2 w-full rounded-full bg-gray-100'>
                  <div
                    className='h-2 rounded-full bg-orange-500'
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
