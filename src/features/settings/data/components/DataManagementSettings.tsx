'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Upload,
  Database,
  HardDrive,
  Trash2,
  RefreshCw,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const DataManagementSettings = () => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState('csv');
  const [backups, setBackups] = useState([
    {
      id: '1',
      date: 'February 14, 2025',
      size: '12.5 MB',
      status: 'Completed',
      type: 'Automatic'
    },
    {
      id: '2',
      date: 'February 13, 2025',
      size: '12.3 MB',
      status: 'Completed',
      type: 'Automatic'
    },
    {
      id: '3',
      date: 'February 12, 2025',
      size: '12.1 MB',
      status: 'Completed',
      type: 'Manual'
    }
  ]);

  const handleExport = (type: string) => {
    toast({
      title: 'Export Started',
      description: `Your ${type} data export has started. You'll be notified when it's ready.`
    });
  };

  const handleImport = () => {
    toast({
      title: 'Import Guide',
      description:
        'Please prepare your CSV/Excel file and select it to import.',
      variant: 'default'
    });
  };

  const handleCreateBackup = () => {
    toast({
      title: 'Backup Created',
      description: 'Manual backup has been created successfully'
    });

    const newBackup = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      size: '12.7 MB',
      status: 'Completed',
      type: 'Manual'
    };
    setBackups([newBackup, ...backups]);
  };

  const handleRestoreBackup = (id: string) => {
    toast({
      title: 'Restore Initiated',
      description: 'Your data will be restored. This may take a few minutes.',
      variant: 'destructive'
    });
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter((b) => b.id !== id));
    toast({
      title: 'Backup Deleted',
      description: 'Backup has been permanently deleted'
    });
  };

  return (
    <div className='space-y-6'>
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <HardDrive className='h-5 w-5' />
            <div>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Your current storage allocation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='mb-2 flex justify-between'>
              <p className='text-sm font-medium'>Total Storage</p>
              <p className='text-sm text-muted-foreground'>15 GB / 100 GB</p>
            </div>
            <Progress value={15} className='h-2' />
          </div>

          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {[
              { label: 'Documents', usage: '8 GB' },
              { label: 'Images', usage: '4 GB' },
              { label: 'Backups', usage: '2 GB' },
              { label: 'Other', usage: '1 GB' }
            ].map((item, idx) => (
              <div
                key={idx}
                className='rounded bg-slate-50 p-3 dark:bg-slate-900'
              >
                <p className='text-xs text-muted-foreground'>{item.label}</p>
                <p className='text-lg font-semibold'>{item.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            <div>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download your data in various formats
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[
              {
                title: 'Products',
                desc: 'All products and inventory data',
                icon: '📦'
              },
              {
                title: 'Sales',
                desc: 'Sales transactions and invoices',
                icon: '💰'
              },
              {
                title: 'Customers',
                desc: 'Customer information and history',
                icon: '👥'
              },
              {
                title: 'Suppliers',
                desc: 'Supplier data and contacts',
                icon: '🏢'
              },
              {
                title: 'Financial',
                desc: 'Ledger and financial reports',
                icon: '📊'
              },
              {
                title: 'All Data',
                desc: 'Complete database export',
                icon: '💾'
              }
            ].map((item, idx) => (
              <Card key={idx} className='border bg-white dark:bg-slate-900'>
                <CardContent className='pt-6'>
                  <div className='mb-3 flex items-start justify-between'>
                    <div>
                      <p className='flex items-center gap-2 font-semibold'>
                        <span>{item.icon}</span> {item.title}
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size='sm'
                        variant='outline'
                        className='w-full'
                        onClick={() => handleExport(item.title)}
                      >
                        <Download className='mr-1 h-3 w-3' />
                        Export
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export {item.title}</DialogTitle>
                        <DialogDescription>
                          Choose export format and options
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4'>
                        <div>
                          <Label>Export Format</Label>
                          <Select
                            value={exportFormat}
                            onValueChange={setExportFormat}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='csv'>CSV</SelectItem>
                              <SelectItem value='xlsx'>Excel (XLSX)</SelectItem>
                              <SelectItem value='pdf'>PDF</SelectItem>
                              <SelectItem value='json'>JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Date Range</Label>
                          <Select defaultValue='all'>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='all'>All Data</SelectItem>
                              <SelectItem value='last30'>
                                Last 30 Days
                              </SelectItem>
                              <SelectItem value='last90'>
                                Last 90 Days
                              </SelectItem>
                              <SelectItem value='custom'>
                                Custom Range
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant='outline' className='flex-1'>
                            Cancel
                          </Button>
                          <Button className='flex-1'>Download</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            <div>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Upload data from CSV, Excel, or JSON files
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='rounded-lg border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-600'>
            <Upload className='mx-auto mb-3 h-8 w-8 text-muted-foreground' />
            <p className='mb-1 font-medium'>Drag and drop your file here</p>
            <p className='mb-4 text-sm text-muted-foreground'>
              or click below to select a file
            </p>
            <Button variant='outline' onClick={handleImport}>
              Select File
            </Button>
          </div>

          <div className='flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
            <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
            <div className='text-sm text-blue-900 dark:text-blue-100'>
              <p className='font-medium'>Supported formats:</p>
              <p className='mt-1 text-xs'>CSV, Excel (.xlsx), JSON</p>
              <p className='mt-2 text-xs'>
                Download a template to see the required format
              </p>
            </div>
          </div>

          <Button variant='outline' className='w-full'>
            Download Import Template
          </Button>
        </CardContent>
      </Card>

      {/* Automatic Backups */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <RefreshCw className='h-5 w-5' />
            <div>
              <CardTitle>Automatic Backups</CardTitle>
              <CardDescription>
                Your data is automatically backed up daily
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {[
            { time: 'Daily', lastRun: 'Today at 2:00 AM', status: 'Enabled' },
            { time: 'Weekly', lastRun: 'Sunday at 3:00 AM', status: 'Enabled' },
            { time: 'Monthly', lastRun: 'Feb 1 at 4:00 AM', status: 'Enabled' }
          ].map((schedule, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between rounded border bg-slate-50 p-3 dark:bg-slate-900'
            >
              <div>
                <p className='text-sm font-medium'>{schedule.time} Backup</p>
                <p className='text-xs text-muted-foreground'>
                  {schedule.lastRun}
                </p>
              </div>
              <Badge variant='outline'>{schedule.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            <div>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage your backups</CardDescription>
            </div>
          </div>
          <Button size='sm' onClick={handleCreateBackup}>
            <RefreshCw className='mr-1 h-4 w-4' />
            Create Backup
          </Button>
        </CardHeader>
        <CardContent className='space-y-2'>
          {backups.map((backup) => (
            <div
              key={backup.id}
              className='flex items-center justify-between rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'
            >
              <div className='flex flex-1 items-center gap-3'>
                <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600' />
                <div>
                  <p className='text-sm font-medium'>{backup.date}</p>
                  <p className='text-xs text-muted-foreground'>
                    {backup.size} • {backup.type}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  {backup.status}
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleRestoreBackup(backup.id)}
                >
                  Restore
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleDeleteBackup(backup.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-green-600' />
            <div>
              <CardTitle>Data Security</CardTitle>
              <CardDescription>
                Your data is encrypted and secure
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-green-900 dark:text-green-100'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4' />
            <span>All data encrypted with AES-256</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4' />
            <span>Multi-region redundancy</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4' />
            <span>GDPR compliant storage</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4' />
            <span>30-day data retention after deletion</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card className='border-red-200 dark:border-red-800'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            <div>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='destructive' className='w-full'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete All Data?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be
                  permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  Before deleting, make sure you have exported all important
                  data. Your data will be retained for 30 days before final
                  deletion.
                </p>
                <div className='flex gap-2'>
                  <Button variant='outline' className='flex-1'>
                    Cancel
                  </Button>
                  <Button variant='destructive' className='flex-1'>
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagementSettings;
