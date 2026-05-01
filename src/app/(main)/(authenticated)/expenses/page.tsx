'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseEntryForm } from '@/features/expenses/components/ExpenseEntryForm';
import { ExpenseList } from '@/features/expenses/components/ExpenseList';
import { BudgetTracker } from '@/features/expenses/components/BudgetTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExpenseCreated = () => {
    // Refresh expense list
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Expense Management
          </h1>
          <p className='mt-2 text-gray-600'>
            Track business and personal expenses, manage budgets, and control
            costs
          </p>
        </div>

        {/* Quick Stats */}
        <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card className='bg-white'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-xs font-semibold text-gray-600'>
                <DollarSign className='h-4 w-4' />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>₹24,500</div>
              <p className='mt-1 text-xs text-gray-500'>Total expenses</p>
            </CardContent>
          </Card>

          <Card className='bg-white'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-xs font-semibold text-gray-600'>
                <BarChart className='h-4 w-4' />
                Budget Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>68%</div>
              <p className='mt-1 text-xs text-gray-500'>of budget used</p>
            </CardContent>
          </Card>

          <Card className='bg-white'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-xs font-semibold text-gray-600'>
                <TrendingUp className='h-4 w-4' />
                Tax Deductible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>₹8,200</div>
              <p className='mt-1 text-xs text-gray-500'>₹2,460 savings</p>
            </CardContent>
          </Card>

          <Card className='bg-white'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-xs font-semibold text-gray-600'>
                <Users className='h-4 w-4' />
                Reimbursable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>₹3,100</div>
              <p className='mt-1 text-xs text-gray-500'>To be recovered</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='mb-6 grid w-full grid-cols-4 lg:grid-cols-4'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='add-expense'>Add Expense</TabsTrigger>
            <TabsTrigger value='list'>All Expenses</TabsTrigger>
            <TabsTrigger value='budgets'>Budgets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Quick Add Card */}
              <Card className='border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100'>
                <CardHeader>
                  <CardTitle className='text-base'>Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='mb-4 text-sm text-gray-700'>
                    Get started by adding your first expense or setting up
                    budgets for cost control.
                  </p>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setActiveTab('add-expense')}
                      className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
                    >
                      Add Expense
                    </button>
                    <button
                      onClick={() => setActiveTab('budgets')}
                      className='rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50'
                    >
                      Set Budget
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Features Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex gap-2'>
                      <span className='text-green-600'>✓</span>
                      <span>Track business & personal expenses</span>
                    </li>
                    <li className='flex gap-2'>
                      <span className='text-green-600'>✓</span>
                      <span>Set monthly budgets per category</span>
                    </li>
                    <li className='flex gap-2'>
                      <span className='text-green-600'>✓</span>
                      <span>Automatic recurring expenses</span>
                    </li>
                    <li className='flex gap-2'>
                      <span className='text-green-600'>✓</span>
                      <span>Budget alerts & forecasting</span>
                    </li>
                    <li className='flex gap-2'>
                      <span className='text-green-600'>✓</span>
                      <span>Tax deductible categorization</span>
                    </li>
                    <li className='flex gap-2'>
                      <span className='text-green-600'>✓</span>
                      <span>Multi-level approval workflow</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Preview */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='py-8 text-center text-gray-500'>
                  <p>Add expenses to see analytics and trends</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Expense Tab */}
          <TabsContent value='add-expense'>
            <ExpenseEntryForm onSuccess={handleExpenseCreated} />
          </TabsContent>

          {/* All Expenses Tab */}
          <TabsContent value='list'>
            <ExpenseList />
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value='budgets'>
            <BudgetTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
