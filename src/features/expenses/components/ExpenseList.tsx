'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface ExpenseListProps {
  onSelectExpense?: (expenseId: string) => void;
}

export function ExpenseList({ onSelectExpense }: ExpenseListProps) {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    categoryId: 'all',
    type: 'all',
    status: 'all'
  });

  const startTimestamp = new Date(filters.startDate).getTime();
  const endTimestamp = new Date(filters.endDate).getTime();

  // Get expenses
  const expenses = useQuery(api.expenses.getExpenses, {
    startDate: startTimestamp,
    endDate: endTimestamp,
    categoryId: filters.categoryId !== 'all' ? filters.categoryId : undefined,
    type: filters.type !== 'all' ? filters.type : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    limit: 100
  });

  // Get categories
  const categories = useQuery(api.expenses.getExpenseCategories, {});

  // Calculate totals
  const totals = expenses
    ? {
        total: expenses.reduce((sum, e) => sum + e.amount, 0),
        business: expenses
          .filter((e) => e.type === 'business')
          .reduce((sum, e) => sum + e.amount, 0),
        personal: expenses
          .filter((e) => e.type === 'personal')
          .reduce((sum, e) => sum + e.amount, 0),
        taxDeductible: expenses
          .filter((e) => e.isTaxDeductible)
          .reduce((sum, e) => sum + e.amount, 0),
        reimbursable: expenses
          .filter((e) => e.isReimbursable)
          .reduce((sum, e) => sum + e.amount, 0)
      }
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reimbursed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c: any) => c._id === categoryId)?.name || 'N/A';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className='space-y-4'>
      {/* Summary Cards */}
      {totals && (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-5'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-semibold text-gray-600'>
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {formatCurrency(totals.total)}
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                {expenses?.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-semibold text-gray-600'>
                Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {formatCurrency(totals.business)}
              </div>
              <Badge className='mt-2 bg-blue-100 text-blue-800'>
                {Math.round((totals.business / totals.total) * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-semibold text-gray-600'>
                Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {formatCurrency(totals.personal)}
              </div>
              <Badge className='mt-2 bg-purple-100 text-purple-800'>
                {Math.round((totals.personal / totals.total) * 100)}%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-semibold text-gray-600'>
                Tax Deductible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {formatCurrency(totals.taxDeductible)}
              </div>
              <Badge className='mt-2 bg-green-100 text-green-800'>
                Savings: {formatCurrency(totals.taxDeductible * 0.3)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-xs font-semibold text-gray-600'>
                Reimbursable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {formatCurrency(totals.reimbursable)}
              </div>
              <p className='mt-1 text-xs text-gray-500'>To be recovered</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-sm'>
            <Filter className='h-4 w-4' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-5'>
            <div>
              <label className='mb-1 block text-xs font-semibold'>
                Start Date
              </label>
              <Input
                type='date'
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className='mb-1 block text-xs font-semibold'>
                End Date
              </label>
              <Input
                type='date'
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className='mb-1 block text-xs font-semibold'>
                Category
              </label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) =>
                  setFilters({ ...filters, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-1 block text-xs font-semibold'>Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='business'>Business</SelectItem>
                  <SelectItem value='personal'>Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-1 block text-xs font-semibold'>Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='All' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Expense Details</CardTitle>
          <CardDescription>
            {expenses?.length || 0} expenses found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses && expenses.length > 0 ? (
                  expenses.map((expense: any) => (
                    <TableRow key={expense._id}>
                      <TableCell className='text-sm'>
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell className='text-sm'>
                        <div className='font-medium'>{expense.description}</div>
                        {expense.vendor && (
                          <div className='text-xs text-gray-500'>
                            {expense.vendor}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {getCategoryName(expense.categoryId)}
                      </TableCell>
                      <TableCell className='text-sm'>
                        <Badge
                          variant='outline'
                          className={
                            expense.type === 'business'
                              ? 'bg-blue-50'
                              : 'bg-purple-50'
                          }
                        >
                          {expense.type}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm font-semibold'>
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className='text-sm'>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onSelectExpense?.(expense._id)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='py-8 text-center text-gray-500'
                    >
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
