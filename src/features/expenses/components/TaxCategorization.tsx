'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface TaxData {
  category: string;
  amount: number;
  deductible: boolean;
  rate: number;
}

export function TaxCategorization() {
  // Mock tax data
  const taxData: TaxData[] = [
    { category: 'Salary & Staff', amount: 8000, deductible: true, rate: 30 },
    { category: 'Utilities & Rent', amount: 3500, deductible: true, rate: 30 },
    { category: 'Office Supplies', amount: 1200, deductible: true, rate: 30 },
    {
      category: 'Travel & Transport',
      amount: 2100,
      deductible: true,
      rate: 30
    },
    { category: 'Marketing', amount: 1400, deductible: true, rate: 30 },
    { category: 'Personal Expenses', amount: 500, deductible: false, rate: 0 }
  ];

  const deductibleExpenses = taxData
    .filter((d) => d.deductible)
    .reduce((sum, d) => sum + d.amount, 0);
  const nonDeductibleExpenses = taxData
    .filter((d) => !d.deductible)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = deductibleExpenses + nonDeductibleExpenses;
  const estimatedTaxSavings = deductibleExpenses * 0.3; // 30% tax rate

  // Pie chart data
  const pieData = [
    {
      name: 'Tax Deductible',
      value: deductibleExpenses,
      fill: '#10b981'
    },
    {
      name: 'Non-Deductible',
      value: nonDeductibleExpenses,
      fill: '#ef4444'
    }
  ];

  // Monthly trend
  const monthlyTrend = [
    { month: 'Jan', deductible: 12000, nonDeductible: 800 },
    { month: 'Feb', deductible: 14200, nonDeductible: 650 },
    { month: 'Mar', deductible: 15800, nonDeductible: 920 },
    { month: 'Apr', deductible: 16200, nonDeductible: 500 }
  ];

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-xs font-semibold text-gray-600'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              Tax Deductible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(deductibleExpenses)}
            </div>
            <p className='mt-1 text-xs text-gray-600'>
              {Math.round((deductibleExpenses / totalExpenses) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-xs font-semibold text-gray-600'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              Non-Deductible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {formatCurrency(nonDeductibleExpenses)}
            </div>
            <p className='mt-1 text-xs text-gray-600'>
              {Math.round((nonDeductibleExpenses / totalExpenses) * 100)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card className='border-green-200 bg-gradient-to-br from-green-50 to-green-100'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-xs font-semibold text-green-900'>
              <TrendingUp className='h-4 w-4' />
              Est. Tax Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-700'>
              {formatCurrency(estimatedTaxSavings)}
            </div>
            <p className='mt-1 text-xs text-green-600'>At 30% tax rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Tax Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='breakdown' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='breakdown'>Breakdown</TabsTrigger>
              <TabsTrigger value='trend'>Trend</TabsTrigger>
              <TabsTrigger value='categories'>Categories</TabsTrigger>
            </TabsList>

            {/* Breakdown Tab */}
            <TabsContent value='breakdown'>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Trend Tab */}
            <TabsContent value='trend'>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='month'
                    stroke='#6b7280'
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke='#6b7280' style={{ fontSize: '12px' }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar
                    dataKey='deductible'
                    stackId='a'
                    fill='#10b981'
                    name='Tax Deductible'
                  />
                  <Bar
                    dataKey='nonDeductible'
                    stackId='a'
                    fill='#ef4444'
                    name='Non-Deductible'
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value='categories'>
              <div className='space-y-2'>
                {taxData.map((tax, idx) => (
                  <div key={idx} className='rounded-lg border p-3'>
                    <div className='mb-2 flex items-start justify-between'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{tax.category}</p>
                        <p className='text-xs text-gray-600'>
                          {formatCurrency(tax.amount)}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        {tax.deductible && (
                          <>
                            <Badge className='bg-green-100 text-green-800'>
                              Deductible
                            </Badge>
                            <span className='text-xs font-bold text-green-600'>
                              -{formatCurrency(tax.amount * (tax.rate / 100))}
                            </span>
                          </>
                        )}
                        {!tax.deductible && (
                          <Badge className='bg-red-100 text-red-800'>
                            Non-Deductible
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-100'>
                      <div
                        className={`h-2 rounded-full ${
                          tax.deductible ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${(tax.amount / totalExpenses) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compliance Info */}
      <Card className='border-blue-200 bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-sm text-blue-900'>
            Tax Compliance Info
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p className='text-xs text-blue-800'>
            ✓ Keep all deductible expense receipts organized for tax filing
          </p>
          <p className='text-xs text-blue-800'>
            ✓ Ensure personal expenses are properly segregated
          </p>
          <p className='text-xs text-blue-800'>
            ✓ Review category assignments to maximize tax deductions
          </p>
          <p className='text-xs text-blue-800'>
            ✓ Maintain documentation for audit trail (3-7 years typically)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
