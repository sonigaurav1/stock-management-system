import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileText, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface ExportJob {
  id: string;
  filename: string;
  format: 'excel' | 'pdf' | 'pptx';
  size: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  downloadUrl: string;
}

const mockExports: ExportJob[] = [
  {
    id: '1',
    filename: 'Monthly_Sales_Summary_Feb2024.xlsx',
    format: 'excel',
    size: '2.4 MB',
    status: 'completed',
    createdAt: 'Today 2:30 PM',
    downloadUrl: '#'
  },
  {
    id: '2',
    filename: 'Inventory_Report_Feb2024.pdf',
    format: 'pdf',
    size: '1.8 MB',
    status: 'completed',
    createdAt: 'Yesterday 3:15 PM',
    downloadUrl: '#'
  },
  {
    id: '3',
    filename: 'Sales_Dashboard_Presentation.pptx',
    format: 'pptx',
    size: '5.2 MB',
    status: 'pending',
    createdAt: 'Today 2:00 PM',
    downloadUrl: '#'
  }
];

export function ReportExportManager() {
  const [exports, setExports] = useState<ExportJob[]>(mockExports);
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'pptx'>(
    'excel'
  );
  const [includeCharts, setIncludeCharts] = useState(true);

  const handleExport = () => {
    const newExport: ExportJob = {
      id: String(exports.length + 1),
      filename: `Report_${new Date().toISOString().split('T')[0]}.${exportFormat === 'pptx' ? 'pptx' : exportFormat}`,
      format: exportFormat,
      size: '0 MB',
      status: 'pending',
      createdAt: 'Just now',
      downloadUrl: '#'
    };
    setExports([newExport, ...exports]);
    setShowExportForm(false);
  };

  const handleDelete = (id: string) => {
    setExports(exports.filter((e) => e.id !== id));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel':
        return '📊';
      case 'pdf':
        return '📄';
      case 'pptx':
        return '🎯';
      default:
        return '📦';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return '';
    }
  };

  return (
    <div className='space-y-4'>
      {/* Export Manager Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Report Export Manager</CardTitle>
              <CardDescription>
                Manage report exports to Excel, PDF, and PowerPoint
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowExportForm(!showExportForm)}
              className='gap-2'
            >
              <FileDown className='h-4 w-4' />
              New Export
            </Button>
          </div>
        </CardHeader>

        {showExportForm && (
          <CardContent className='pt-0'>
            <div className='mt-4 rounded-lg border bg-gray-50 p-4 dark:bg-slate-700'>
              <h3 className='mb-4 font-semibold'>Export Report</h3>
              <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    File Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className='w-full rounded-lg border px-3 py-2 dark:bg-slate-800'
                  >
                    <option value='excel'>Excel (.xlsx)</option>
                    <option value='pdf'>PDF (.pdf)</option>
                    <option value='pptx'>PowerPoint (.pptx)</option>
                  </select>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium'>
                    File Name
                  </label>
                  <input
                    type='text'
                    className='w-full rounded-lg border px-3 py-2 dark:bg-slate-800'
                    placeholder='Report_2024'
                  />
                </div>
              </div>

              <div className='mb-4 rounded-lg border bg-white p-3 dark:bg-slate-800'>
                <label className='flex cursor-pointer items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className='h-4 w-4'
                  />
                  <span className='text-sm font-medium'>Include Charts</span>
                </label>
                <p className='ml-6 mt-2 text-xs text-muted-foreground'>
                  Include visual charts and graphs in the export
                </p>
              </div>

              <div className='flex gap-2'>
                <Button onClick={handleExport} className='flex-1 gap-2'>
                  <FileDown className='h-4 w-4' />
                  Start Export
                </Button>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setShowExportForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            Recent report exports and download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {exports.map((exportJob) => (
              <div
                key={exportJob.id}
                className='flex items-center justify-between rounded-lg border p-4 transition hover:shadow-md'
              >
                <div className='flex flex-1 items-center gap-4'>
                  <span className='text-2xl'>
                    {getFormatIcon(exportJob.format)}
                  </span>
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium'>
                      {exportJob.filename}
                    </h4>
                    <div className='mt-1 flex items-center gap-2'>
                      <Badge
                        className={`text-xs font-medium ${getStatusBadge(exportJob.status)}`}
                      >
                        {exportJob.status === 'completed' && (
                          <CheckCircle className='mr-1 h-3 w-3' />
                        )}
                        {exportJob.status === 'pending' && (
                          <Clock className='mr-1 h-3 w-3' />
                        )}
                        {exportJob.status.charAt(0).toUpperCase() +
                          exportJob.status.slice(1)}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {exportJob.size}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        • {exportJob.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex gap-2'>
                  {exportJob.status === 'completed' && (
                    <Button size='sm' className='h-8 gap-2'>
                      <FileDown className='h-3 w-3' />
                      Download
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => handleDelete(exportJob.id)}
                    className='h-8 w-8 p-0'
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {exports.length === 0 && (
            <div className='py-12 text-center'>
              <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50' />
              <p className='text-muted-foreground'>No exports yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Formats */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className='mr-2 inline h-5 w-5' />
            Supported Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='rounded-lg border p-4'>
              <h4 className='mb-2 text-sm font-semibold'>📊 Excel (.xlsx)</h4>
              <ul className='space-y-1 text-xs text-muted-foreground'>
                <li>• Multiple sheets</li>
                <li>• Formatted tables</li>
                <li>• Pivot tables</li>
                <li>• Charts included</li>
              </ul>
            </div>
            <div className='rounded-lg border p-4'>
              <h4 className='mb-2 text-sm font-semibold'>📄 PDF (.pdf)</h4>
              <ul className='space-y-1 text-xs text-muted-foreground'>
                <li>• Print-ready</li>
                <li>• Professional format</li>
                <li>• Preserve layout</li>
                <li>• Charts included</li>
              </ul>
            </div>
            <div className='rounded-lg border p-4'>
              <h4 className='mb-2 text-sm font-semibold'>
                🎯 PowerPoint (.pptx)
              </h4>
              <ul className='space-y-1 text-xs text-muted-foreground'>
                <li>• Presentation slides</li>
                <li>• Interactive charts</li>
                <li>• Editable content</li>
                <li>• Custom branding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
