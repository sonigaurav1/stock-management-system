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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Play, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function ReportBuilder() {
  const [reportName, setReportName] = useState('New Report');
  const [dataSource, setDataSource] = useState('sales');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'date',
    'amount'
  ]);
  const [filters, setFilters] = useState<
    Array<{ field: string; operator: string; value: any }>
  >([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);

  const columnOptions: Record<string, string[]> = {
    sales: [
      'date',
      'amount',
      'customerName',
      'quantitySold',
      'totalAmount',
      'paymentStatus'
    ],
    transactions: ['date', 'amount', 'description', 'category', 'type'],
    products: [
      'name',
      'sku',
      'category',
      'stockLevel',
      'sellingPrice',
      'inStock'
    ],
    payments: [
      'amountPaid',
      'paymentMode',
      'invoiceNumber',
      'paidAt',
      'paymentStatus'
    ]
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: 'date', operator: 'equals', value: '' }]);
  };

  const handleAddGroupBy = () => {
    setGroupBy([...groupBy, 'date']);
  };

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950 dark:to-blue-950'>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>
            Drag-and-drop report creation with filters and grouping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Report Name & Data Source */}
            <div className='grid grid-cols-1 gap-4 rounded-lg bg-white p-4 dark:bg-slate-800 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Report Name
                </label>
                <input
                  type='text'
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className='w-full rounded-lg border px-3 py-2 dark:bg-slate-700'
                  placeholder='My Custom Report'
                />
              </div>
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  Data Source
                </label>
                <select
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value)}
                  className='w-full rounded-lg border px-3 py-2 dark:bg-slate-700'
                >
                  <option value='sales'>Sales</option>
                  <option value='transactions'>Transactions</option>
                  <option value='products'>Products</option>
                  <option value='payments'>Payments</option>
                </select>
              </div>
            </div>

            {/* Column Selection */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Select Columns (Drag to Reorder)
              </h3>
              <div className='rounded-lg border-2 border-dashed bg-white p-4 dark:bg-slate-800'>
                <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                  {columnOptions[dataSource]?.map((col) => (
                    <div
                      key={col}
                      className={`cursor-move rounded-lg p-3 transition ${
                        selectedColumns.includes(col)
                          ? 'bg-violet-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700'
                      }`}
                      onClick={() => {
                        if (selectedColumns.includes(col)) {
                          setSelectedColumns(
                            selectedColumns.filter((c) => c !== col)
                          );
                        } else {
                          setSelectedColumns([...selectedColumns, col]);
                        }
                      }}
                    >
                      <p className='text-xs font-medium capitalize'>{col}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className='text-xs text-muted-foreground'>
                Selected: {selectedColumns.length} columns
              </p>
            </div>

            {/* Filters */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Filters</h3>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleAddFilter}
                  className='gap-2'
                >
                  <Plus className='h-3 w-3' />
                  Add Filter
                </Button>
              </div>
              <div className='space-y-2'>
                {filters.map((filter, idx) => (
                  <div
                    key={idx}
                    className='flex gap-2 rounded-lg bg-white p-3 dark:bg-slate-800'
                  >
                    <select
                      className='flex-1 rounded border px-2 py-1 text-sm dark:bg-slate-700'
                      value={filter.field}
                      onChange={(e) => {
                        const newFilters = [...filters];
                        newFilters[idx].field = e.target.value;
                        setFilters(newFilters);
                      }}
                    >
                      {columnOptions[dataSource]?.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    <select
                      className='rounded border px-2 py-1 text-sm dark:bg-slate-700'
                      value={filter.operator}
                      onChange={(e) => {
                        const newFilters = [...filters];
                        newFilters[idx].operator = e.target.value;
                        setFilters(newFilters);
                      }}
                    >
                      <option value='equals'>Equals</option>
                      <option value='contains'>Contains</option>
                      <option value='greater_than'>Greater Than</option>
                      <option value='less_than'>Less Than</option>
                    </select>
                    <input
                      type='text'
                      className='flex-1 rounded border px-2 py-1 text-sm dark:bg-slate-700'
                      placeholder='Value'
                      onChange={(e) => {
                        const newFilters = [...filters];
                        newFilters[idx].value = e.target.value;
                        setFilters(newFilters);
                      }}
                    />
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => {
                        setFilters(filters.filter((_, i) => i !== idx));
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Group By */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>Group By</h3>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleAddGroupBy}
                  className='gap-2'
                >
                  <Plus className='h-3 w-3' />
                  Add Group
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {groupBy.map((group, idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900'
                  >
                    <span className='text-sm font-medium capitalize'>
                      {group}
                    </span>
                    <button
                      onClick={() =>
                        setGroupBy(groupBy.filter((_, i) => i !== idx))
                      }
                      className='text-blue-700 hover:text-blue-900 dark:text-blue-300'
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 border-t pt-4'>
              <Button className='flex-1 gap-2' variant='default'>
                <Play className='h-4 w-4' />
                Preview Report
              </Button>
              <Button className='flex-1 gap-2' variant='outline'>
                <Save className='h-4 w-4' />
                Save Report
              </Button>
              <Button className='flex-1 gap-2' variant='outline'>
                <Copy className='h-4 w-4' />
                Duplicate
              </Button>
            </div>

            {/* Builder Features */}
            <div className='rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-700 dark:bg-violet-900'>
              <h4 className='mb-2 text-sm font-semibold text-violet-900 dark:text-violet-100'>
                Builder Features
              </h4>
              <ul className='space-y-1 text-sm text-violet-800 dark:text-violet-200'>
                <li>• Drag-and-drop column selection</li>
                <li>• Multiple filter conditions</li>
                <li>• Group and aggregate data</li>
                <li>• Sort by any column</li>
                <li>• Save and reuse templates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
