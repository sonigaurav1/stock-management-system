'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Database,
  FileText,
  Clock,
  HardDrive,
  Trash2
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import NotFound from '@/app/not-found';

export default function DatabasePage() {
  if (process.env.NODE_ENV === 'production') {
    return <NotFound />;
  }

  const router = useRouter();
  const stats = useQuery(api.admin.getDatabaseStatistics);
  const deleteAllDocuments = useMutation(api.admin.deleteAllDocuments);
  const deleteAllTables = useMutation(api.admin.deleteAllTables);
  const [deletingTable, setDeletingTable] = useState<string | null>(null);
  const [isDeletingAllTables, setIsDeletingAllTables] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!stats) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  const handleDeleteTable = async () => {
    if (!deletingTable) return;

    setIsDeleting(true);
    try {
      await deleteAllDocuments({ tableName: deletingTable });
      toast.success(`All documents deleted from ${deletingTable}`);
      setDeletingTable(null);
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete documents'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllTables = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAllTables({});
      toast.success(`Deleted ${result.totalDeleted} documents from all tables`);
      setIsDeletingAllTables(false);
    } catch (error) {
      console.error('Error deleting all tables:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete all tables'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-3xl font-bold'>
              <Database className='h-8 w-8' />
              Database Statistics
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Overview of all database tables and their document counts
            </p>
          </div>
          <Button
            onClick={() => setIsDeletingAllTables(true)}
            variant='destructive'
            disabled={!stats || stats.totalDocuments === 0}
            className='gap-2'
          >
            <Trash2 className='h-4 w-4' />
            Delete All Tables
          </Button>
        </div>

        {/* Summary Cards */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>{stats.totalTables}</div>
              <p className='text-xs text-muted-foreground'>Database tables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>
                {stats.totalDocuments.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>Across all tables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-sm font-semibold'>
                {new Date(stats.timestamp).toLocaleTimeString()}
              </div>
              <p className='text-xs text-muted-foreground'>
                {new Date(stats.timestamp).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <div>
          <h2 className='mb-4 text-xl font-semibold'>Table Details</h2>
          <ScrollArea className='h-[600px] rounded-lg border'>
            <div className='grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-3'>
              {stats.tables.map((table: any) => (
                <Card
                  key={table.name}
                  className='flex cursor-pointer flex-col transition-shadow hover:shadow-md'
                  onClick={() =>
                    router.push(`/database/${encodeURIComponent(table.name)}`)
                  }
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <CardTitle className='text-base'>
                          {table.name}
                        </CardTitle>
                        <Badge
                          className={`mt-2 ${getStatusColor(table.status)}`}
                          variant='secondary'
                        >
                          {table.status}
                        </Badge>
                      </div>
                      <FileText className='h-5 w-5 text-muted-foreground' />
                    </div>
                  </CardHeader>

                  <CardContent className='flex-1 space-y-3'>
                    {/* Document Count */}
                    <div className='flex items-center justify-between rounded bg-muted p-2'>
                      <span className='text-sm font-medium'>Documents:</span>
                      <span className='text-lg font-bold text-primary'>
                        {table.documentCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Average Size */}
                    <div className='flex items-center gap-2 text-sm'>
                      <HardDrive className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>Avg Size:</span>
                      <span className='font-semibold'>
                        {formatBytes(table.avgSize)}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div className='flex items-center gap-2 text-sm'>
                      <Clock className='h-4 w-4 text-muted-foreground' />
                      <span className='text-muted-foreground'>Updated:</span>
                      <span className='font-semibold'>{table.lastUpdated}</span>
                    </div>

                    {/* Indexed Status */}
                    <div className='flex items-center gap-2 text-sm'>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          table.indexed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <span className='text-muted-foreground'>
                        {table.indexed ? 'Indexed' : 'Not Indexed'}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingTable(table.name);
                      }}
                      variant='destructive'
                      size='sm'
                      className='mt-2 w-full'
                      disabled={table.documentCount === 0}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete All ({table.documentCount})
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Table Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Average documents per table:
                </p>
                <p className='text-2xl font-bold'>
                  {Math.round(stats.totalDocuments / stats.totalTables)}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Largest table:</p>
                <p className='text-2xl font-bold'>
                  {stats.tables[0]?.name || 'N/A'}
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  ({stats.tables[0]?.documentCount.toLocaleString() || 0}{' '}
                  documents)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete All Tables Confirmation Dialog */}
      <AlertDialog
        open={isDeletingAllTables}
        onOpenChange={() => setIsDeletingAllTables(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-destructive'>
              Delete All Tables?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{' '}
              <span className='font-semibold text-foreground'>
                ALL documents from ALL tables
              </span>{' '}
              in the database? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-200'>
            ⚠️ This will delete all{' '}
            {stats?.totalDocuments?.toLocaleString() || 0} documents across{' '}
            {stats?.totalTables || 0} tables permanently.
          </div>
          <div className='flex gap-2'>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllTables}
              disabled={isDeleting}
              className='bg-destructive hover:bg-destructive/90'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete All Tables
                </>
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single Table Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTable}
        onOpenChange={() => setDeletingTable(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Documents?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all documents from the{' '}
              <span className='font-semibold text-foreground'>
                {deletingTable}
              </span>{' '}
              table? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-200'>
            ⚠️ This will delete all{' '}
            {stats.tables.find((t: any) => t.name === deletingTable)
              ?.documentCount || 0}{' '}
            documents permanently.
          </div>
          <div className='flex gap-2'>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTable}
              disabled={isDeleting}
              className='bg-destructive hover:bg-destructive/90'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete All Documents
                </>
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
