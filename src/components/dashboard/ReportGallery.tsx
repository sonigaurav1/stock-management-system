import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Edit, Trash2, Copy, Share2, Search } from 'lucide-react';
import { useState } from 'react';

interface CustomReport {
  id: string;
  name: string;
  type: 'sales' | 'transactions' | 'products' | 'payments';
  dataSource: string;
  lastUpdated: string;
  columns: string[];
  filters: any[];
}

const mockReports: CustomReport[] = [
  {
    id: '1',
    name: 'Monthly Sales Summary',
    type: 'sales',
    dataSource: 'sales',
    lastUpdated: 'Today',
    columns: ['date', 'amount', 'quantitySold'],
    filters: [{ field: 'date', operator: 'greater_than', value: '30d ago' }]
  },
  {
    id: '2',
    name: 'Product Performance',
    type: 'products',
    dataSource: 'products',
    lastUpdated: 'Yesterday',
    columns: ['name', 'category', 'stockLevel', 'sellingPrice'],
    filters: []
  },
  {
    id: '3',
    name: 'Payment Status Report',
    type: 'payments',
    dataSource: 'payments',
    lastUpdated: '3 days ago',
    columns: ['amountPaid', 'paymentMode', 'paymentStatus'],
    filters: [{ field: 'paymentStatus', operator: 'equals', value: 'pending' }]
  }
];

export function ReportGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const filteredReports = mockReports.filter((report) =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'products':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'payments':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  if ((viewType as string) === 'grid') {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Report Gallery</CardTitle>
                <CardDescription>
                  Browse and manage your saved reports
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant={viewType === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewType('grid')}
                >
                  Grid
                </Button>
                <Button
                  size='sm'
                  variant={viewType === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewType('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='mb-4 flex gap-2'>
              <Search className='mt-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search reports...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='flex-1'
              />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className='rounded-lg border bg-white p-4 transition hover:shadow-lg dark:bg-slate-800'
                >
                  <div className='mb-3 flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                      <FileText className='h-5 w-5 text-blue-500' />
                      <h3 className='text-sm font-semibold'>{report.name}</h3>
                    </div>
                  </div>

                  <div className='mb-4 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(report.type)}`}
                      >
                        {report.type.charAt(0).toUpperCase() +
                          report.type.slice(1)}
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Columns: {report.columns.join(', ')}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Updated: {report.lastUpdated}
                    </p>
                  </div>

                  <div className='flex gap-1 border-t pt-3'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 flex-1 gap-1'
                    >
                      <Edit className='h-3 w-3' />
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 flex-1 gap-1'
                    >
                      <Copy className='h-3 w-3' />
                      Duplicate
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 flex-1 gap-1'
                    >
                      <Share2 className='h-3 w-3' />
                      Share
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 flex-1 gap-1'
                    >
                      <Trash2 className='h-3 w-3' />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className='py-12 text-center'>
                <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50' />
                <p className='text-muted-foreground'>No reports found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Report Gallery</CardTitle>
              <CardDescription>
                Browse and manage your saved reports
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={viewType === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewType('grid')}
              >
                Grid
              </Button>
              <Button
                size='sm'
                variant={viewType === 'list' ? 'default' : 'outline'}
                onClick={() => setViewType('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex gap-2'>
            <Search className='mt-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search reports...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='flex-1'
            />
          </div>

          <div className='space-y-2'>
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className='flex items-center justify-between rounded-lg border p-3 transition hover:bg-gray-50 dark:hover:bg-slate-700'
              >
                <div className='flex flex-1 items-center gap-3'>
                  <FileText className='h-5 w-5 flex-shrink-0 text-blue-500' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium'>{report.name}</h4>
                    <div className='mt-1 flex items-center gap-2'>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(report.type)}`}
                      >
                        {report.type.charAt(0).toUpperCase() +
                          report.type.slice(1)}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        Updated {report.lastUpdated}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex gap-1'>
                  <Button size='sm' variant='ghost' className='h-7 w-7 p-0'>
                    <Edit className='h-3 w-3' />
                  </Button>
                  <Button size='sm' variant='ghost' className='h-7 w-7 p-0'>
                    <Copy className='h-3 w-3' />
                  </Button>
                  <Button size='sm' variant='ghost' className='h-7 w-7 p-0'>
                    <Share2 className='h-3 w-3' />
                  </Button>
                  <Button size='sm' variant='ghost' className='h-7 w-7 p-0'>
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className='py-12 text-center'>
              <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50' />
              <p className='text-muted-foreground'>No reports found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
