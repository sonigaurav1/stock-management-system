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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, Zap, AlertCircle } from 'lucide-react';

export function BudgetStatusWidget() {
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);

  // Get budget status
  const budgetStatus = useQuery(api.expenses.getBudgetStatus, {
    month: currentMonth
  });

  if (!budgetStatus || budgetStatus.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Budget Status</CardTitle>
          <CardDescription className='text-xs'>
            No budgets configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='py-6 text-center text-gray-500'>
            <p className='text-sm'>Set up budgets to track spending</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall metrics
  const totalBudget = budgetStatus.reduce(
    (sum: number, b: any) => sum + b.amount,
    0
  );
  const totalSpent = budgetStatus.reduce(
    (sum: number, b: any) => sum + b.spent,
    0
  );
  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Count status indicators
  const exceeded = budgetStatus.filter(
    (b: any) => b.status === 'exceeded'
  ).length;
  const warning = budgetStatus.filter(
    (b: any) => b.status === 'warning'
  ).length;
  const onTrack = budgetStatus.filter(
    (b: any) => b.status === 'on_track'
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_track':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHeaderColor = (status: string) => {
    if (exceeded > 0) return 'from-red-50 to-red-100 border-red-200';
    if (warning > 0) return 'from-yellow-50 to-yellow-100 border-yellow-200';
    return 'from-green-50 to-green-100 border-green-200';
  };

  return (
    <Card
      className={`bg-gradient-to-r ${getHeaderColor(overallPercentage > 100 ? 'exceeded' : overallPercentage > 75 ? 'warning' : 'on_track')} border`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-base'>
              Budget Status - {currentMonth}
            </CardTitle>
            <CardDescription className='text-xs'>
              {budgetStatus.length} budget{budgetStatus.length !== 1 ? 's' : ''}{' '}
              configured
            </CardDescription>
          </div>
          <div className='flex gap-1'>
            {exceeded > 0 && (
              <Badge className='bg-red-100 text-xs text-red-800'>
                {exceeded} Exceeded
              </Badge>
            )}
            {warning > 0 && (
              <Badge className='bg-yellow-100 text-xs text-yellow-800'>
                {warning} warning
              </Badge>
            )}
            {onTrack > 0 && (
              <Badge className='bg-green-100 text-xs text-green-800'>
                {onTrack} OK
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Overall Progress */}
        <div className='rounded-lg border bg-white p-3'>
          <div className='mb-2 flex justify-between'>
            <span className='text-xs font-semibold'>Overall Budget</span>
            <span className='text-xs font-bold'>
              {Math.round(overallPercentage)}%
            </span>
          </div>
          <Progress value={Math.min(overallPercentage, 100)} className='h-2' />
          <div className='mt-2 flex justify-between text-xs text-gray-600'>
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>of {formatCurrency(totalBudget)}</span>
          </div>
        </div>

        {/* Top Categories */}
        <div className='space-y-2'>
          <p className='text-xs font-semibold text-gray-700'>Top Categories</p>
          {budgetStatus.slice(0, 3).map((budget: any) => (
            <div
              key={budget._id}
              className={`rounded border p-2 ${getStatusColor(budget.status)}`}
            >
              <div className='mb-1 flex items-start justify-between'>
                <span className='text-xs font-medium'>
                  {budget.categoryId || 'Overall'}
                </span>
                {budget.status === 'exceeded' && (
                  <AlertTriangle className='h-3 w-3' />
                )}
                {budget.status === 'warning' && (
                  <AlertCircle className='h-3 w-3' />
                )}
                {budget.status === 'on_track' && <Zap className='h-3 w-3' />}
              </div>
              <div className='mb-1 flex justify-between text-xs'>
                <span>{Math.round(budget.percentage)}%</span>
                <span className='text-gray-600'>
                  {formatCurrency(budget.spent)} /{' '}
                  {formatCurrency(budget.amount)}
                </span>
              </div>
              <Progress
                value={Math.min(budget.percentage, 100)}
                className='h-1.5'
              />
            </div>
          ))}
        </div>

        {/* Alert */}
        {overallPercentage > 100 && (
          <div className='flex items-start gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700'>
            <AlertTriangle className='mt-0.5 h-3 w-3 flex-shrink-0' />
            <span>
              Over budget by{' '}
              <strong>{formatCurrency(totalSpent - totalBudget)}</strong>.
              Review expenses.
            </span>
          </div>
        )}
        {overallPercentage > 75 && overallPercentage <= 100 && (
          <div className='flex items-start gap-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-700'>
            <AlertCircle className='mt-0.5 h-3 w-3 flex-shrink-0' />
            <span>
              You're using <strong>{Math.round(overallPercentage)}%</strong> of
              your budget. Be cautious with remaining spending.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
