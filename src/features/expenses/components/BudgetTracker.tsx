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
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle
} from 'lucide-react';

export function BudgetTracker() {
  const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7); // "2026-04"

  // Get budget status
  const budgetStatus = useQuery(api.expenses.getBudgetStatus, {
    month: currentMonth
  });

  // Get budget forecast
  const budgetForecast = useQuery(api.budget.getBudgetForecast, {
    month: currentMonth
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      case 'warning':
        return <AlertCircle className='h-4 w-4 text-yellow-500' />;
      case 'on_track':
        return <Zap className='h-4 w-4 text-green-500' />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'on_track':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Calculate overall metrics
  const totalBudget = budgetStatus
    ? budgetStatus.reduce((sum: number, b: any) => sum + b.amount, 0)
    : 0;
  const totalSpent = budgetStatus
    ? budgetStatus.reduce((sum: number, b: any) => sum + b.spent, 0)
    : 0;
  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className='space-y-4'>
      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>
            Budget Summary - {currentMonth}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='mb-2 flex justify-between'>
              <span className='text-sm font-medium'>Overall Budget Usage</span>
              <span className='text-sm font-bold'>
                {Math.round(overallPercentage)}%
              </span>
            </div>
            <Progress
              value={Math.min(overallPercentage, 100)}
              className='h-3'
            />
            <div className='mt-2 flex justify-between text-xs text-gray-600'>
              <span>{formatCurrency(totalSpent)} spent</span>
              <span>of {formatCurrency(totalBudget)} total</span>
            </div>
          </div>

          {overallPercentage > 100 && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              ⚠️ You've exceeded your total budget by{' '}
              {formatCurrency(totalSpent - totalBudget)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Budgets */}
      {budgetStatus && budgetStatus.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {budgetStatus.map((budget: any) => (
            <Card
              key={budget._id}
              className={`border ${getStatusColor(budget.status)}`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-sm'>
                      {budget.categoryId || 'Overall Budget'}
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      {formatCurrency(budget.amount)} monthly limit
                    </CardDescription>
                  </div>
                  <div className='flex-shrink-0'>
                    {getStatusIcon(budget.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                {/* Progress Bar */}
                <div>
                  <div className='mb-1 flex justify-between'>
                    <span className='text-xs font-semibold'>
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className='text-xs text-gray-600'>
                      {Math.round(budget.percentage)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className='h-2'
                  />
                </div>

                {/* Status Badge */}
                <div className='flex items-center justify-between'>
                  <Badge
                    className={
                      budget.status === 'exceeded'
                        ? 'bg-red-100 text-red-800'
                        : budget.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }
                  >
                    {budget.status === 'exceeded'
                      ? `Exceeded by ${formatCurrency(budget.spent - budget.amount)}`
                      : `${formatCurrency(budget.remaining)} remaining`}
                  </Badge>
                </div>

                {/* Alert if threshold reached */}
                {budget.percentage >= budget.alertThreshold * 100 && (
                  <div className='flex items-center gap-1 text-xs text-orange-600'>
                    <AlertCircle className='h-3 w-3' /> Budget alert: threshold
                    reached
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='py-8 text-center text-gray-500'>
            <p>No budgets configured for {currentMonth}</p>
            <p className='mt-1 text-xs'>
              Create a budget to track your spending
            </p>
          </CardContent>
        </Card>
      )}

      {/* Budget Forecast */}
      {budgetForecast && budgetForecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Budget Forecast</CardTitle>
            <CardDescription>
              Projected spending based on recurring expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {budgetForecast.map((forecast: any, idx: number) => (
                <div
                  key={idx}
                  className='flex items-center justify-between rounded bg-gray-50 p-2'
                >
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>
                      {forecast.categoryId || 'Overall'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Current: {formatCurrency(forecast.spent)} → Projected:{' '}
                      {formatCurrency(forecast.projectedTotal)}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div
                      className={`text-xs font-bold ${
                        forecast.forecast === 'over_budget'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {forecast.forecast === 'over_budget' ? (
                        <TrendingUp className='mr-1 inline h-4 w-4' />
                      ) : (
                        <TrendingDown className='mr-1 inline h-4 w-4' />
                      )}
                      {Math.round(forecast.projectedPercentage)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
