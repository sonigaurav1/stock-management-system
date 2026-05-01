'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Database,
  Calendar,
  CheckCircle
} from 'lucide-react';

export function EnterpriseDataExport() {
  const handleExport = (format: string) => {
    console.debug(`Exporting data as ${format}`);
    // Implement actual export logic
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Data Export</h2>
        <p className='text-sm text-muted-foreground'>
          Export your data in various formats for analysis and backup
        </p>
      </div>

      {/* Export Options */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='cursor-pointer border-2 transition-colors hover:border-primary'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>CSV Export</CardTitle>
              <FileSpreadsheet className='h-8 w-8 text-green-500' />
            </div>
            <CardDescription>Comma-separated values format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Best for spreadsheet applications and data analysis
              </p>
              <Button className='w-full' onClick={() => handleExport('csv')}>
                <Download className='mr-2 h-4 w-4' />
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='cursor-pointer border-2 transition-colors hover:border-primary'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>JSON Export</CardTitle>
              <FileJson className='h-8 w-8 text-blue-500' />
            </div>
            <CardDescription>JavaScript Object Notation format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Best for developers and API integration
              </p>
              <Button className='w-full' onClick={() => handleExport('json')}>
                <Download className='mr-2 h-4 w-4' />
                Export as JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='cursor-pointer border-2 transition-colors hover:border-primary'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Database Backup</CardTitle>
              <Database className='h-8 w-8 text-purple-500' />
            </div>
            <CardDescription>Complete database snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Full system backup for disaster recovery
              </p>
              <Button className='w-full' onClick={() => handleExport('backup')}>
                <Download className='mr-2 h-4 w-4' />
                Create Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Export Settings</CardTitle>
          <CardDescription>Customize your export parameters</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>Data Type</label>
              <Select defaultValue='all'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Data</SelectItem>
                  <SelectItem value='sales'>Sales Data</SelectItem>
                  <SelectItem value='inventory'>Inventory Data</SelectItem>
                  <SelectItem value='users'>User Data</SelectItem>
                  <SelectItem value='reports'>Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Date Range</label>
              <Select defaultValue='all-time'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all-time'>All Time</SelectItem>
                  <SelectItem value='this-year'>This Year</SelectItem>
                  <SelectItem value='this-month'>This Month</SelectItem>
                  <SelectItem value='custom'>Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Format</label>
              <Select defaultValue='csv'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='csv'>CSV</SelectItem>
                  <SelectItem value='json'>JSON</SelectItem>
                  <SelectItem value='xml'>XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium'>Compression</label>
              <Select defaultValue='zip'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  <SelectItem value='zip'>ZIP</SelectItem>
                  <SelectItem value='gzip'>GZIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <Button className='w-full' size='lg'>
            <Download className='mr-2 h-4 w-4' />
            Export with Custom Settings
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exports</CardTitle>
          <CardDescription>
            Automatically export data on a schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='flex items-center gap-3'>
                <Calendar className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>Daily Sales Report</p>
                  <p className='text-sm text-muted-foreground'>
                    Exported daily at 11:00 PM
                  </p>
                </div>
              </div>
              <Badge className='flex items-center gap-1'>
                <CheckCircle className='h-3 w-3' />
                Active
              </Badge>
            </div>
            <Separator />
            <div className='flex items-center justify-between rounded-lg border p-4 opacity-50 grayscale'>
              <div className='flex items-center gap-3'>
                <Calendar className='h-5 w-5 text-muted-foreground' />
                <div>
                  <p className='font-medium'>Weekly Inventory Snapshot</p>
                  <p className='text-sm text-muted-foreground'>
                    Exported every Monday at 6:00 AM
                  </p>
                </div>
              </div>
              <Badge variant='outline'>Inactive</Badge>
            </div>
            <Button className='w-full' variant='outline'>
              Add Scheduled Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='max-h-64 space-y-2 overflow-y-auto'>
            {[
              {
                name: 'sales_report_april_2026.csv',
                size: '2.4 MB',
                date: 'Apr 18, 2026'
              },
              {
                name: 'inventory_backup_april_2026.json',
                size: '8.7 MB',
                date: 'Apr 18, 2026'
              },
              {
                name: 'user_data_export.csv',
                size: '1.2 MB',
                date: 'Apr 17, 2026'
              },
              {
                name: 'database_backup_april_2026.zip',
                size: '125 MB',
                date: 'Apr 15, 2026'
              }
            ].map((exp, idx) => (
              <div
                key={idx}
                className='flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted'
              >
                <div>
                  <p className='text-sm font-medium'>{exp.name}</p>
                  <p className='text-xs text-muted-foreground'>{exp.date}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>{exp.size}</Badge>
                  <Button variant='ghost' size='sm'>
                    <Download className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
