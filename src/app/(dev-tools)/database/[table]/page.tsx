'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowLeft,
  Database,
  Trash2,
  ChevronDown,
  ChevronRight,
  FileText
} from 'lucide-react';
import NotFound from '@/app/not-found';
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

interface DocumentRow {
  _id: string;
  [key: string]: unknown;
}

export default function DatabaseTablePage() {
  if (process.env.NODE_ENV === 'production') {
    return <NotFound />;
  }

  const params = useParams<{ table: string }>();
  const router = useRouter();
  const tableName = useMemo(
    () => decodeURIComponent(params?.table ?? ''),
    [params?.table]
  );

  const tableResult = useQuery(
    api.admin.getTableDocuments,
    tableName ? { tableName, limit: 200 } : 'skip'
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshKey, setRefreshKey] = useState(0);

  const deleteDocumentById = useMutation(api.admin.deleteDocumentById);

  // Refresh data after delete
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [deletingDoc, setDeletingDoc] = useState<DocumentRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpand = (docId: string) => {
    setExpandedDocs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleDeleteDocument = async () => {
    if (!deletingDoc || !tableName) return;

    setIsDeleting(true);
    try {
      await deleteDocumentById({
        tableName,
        docId: deletingDoc._id as any
      });
      toast.success(`Document deleted from ${tableName}`);
      refreshData();
      setDeletingDoc(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete document'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!tableName) {
    return (
      <PageContainer>
        <div className='flex h-full items-center justify-center'>
          <p className='text-sm text-muted-foreground'>Invalid table name.</p>
        </div>
      </PageContainer>
    );
  }

  if (!tableResult) {
    return (
      <PageContainer>
        <div className='flex h-full items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      </PageContainer>
    );
  }

  // Get display fields (excluding internal fields)
  const getDisplayFields = (doc: DocumentRow) => {
    const excludeFields = ['_id', '_creationTime'];
    return Object.entries(doc).filter(([key]) => !excludeFields.includes(key));
  };

  // Format field value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold'>
              <Database className='h-6 w-6' />
              {tableResult.tableName} JSON Data
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              Showing {tableResult.returnedCount.toLocaleString()} of{' '}
              {tableResult.totalCount.toLocaleString()} documents
            </p>
          </div>
          <Button variant='outline' onClick={() => router.push('/database')}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to tables
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Documents ({tableResult.data.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tableResult.data.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No records found.</p>
            ) : (
              <div className='space-y-2'>
                {(tableResult.data as DocumentRow[]).map((doc, index) => (
                  <div
                    key={doc._id}
                    className='rounded-lg border border-border'
                  >
                    {/* Document Header - Always Visible */}
                    <div
                      className='flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-muted/50'
                      onClick={() => toggleExpand(doc._id)}
                    >
                      <div className='flex min-w-0 flex-1 items-center gap-3'>
                        {expandedDocs.has(doc._id) ? (
                          <ChevronDown className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                        ) : (
                          <ChevronRight className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                        )}
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2 text-sm'>
                            <span className='font-mono text-muted-foreground'>
                              #{index + 1}
                            </span>
                            <span className='truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
                              {doc._id}
                            </span>
                          </div>
                          {/* Preview first few fields */}
                          <div className='mt-1 flex flex-wrap gap-1'>
                            {getDisplayFields(doc)
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <span
                                  key={key}
                                  className='text-xs text-muted-foreground'
                                >
                                  {key}:{' '}
                                  <span className='font-medium'>
                                    {formatValue(value).slice(0, 30)}
                                  </span>
                                </span>
                              ))}
                            {getDisplayFields(doc).length > 3 && (
                              <span className='text-xs text-muted-foreground'>
                                +{getDisplayFields(doc).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingDoc(doc);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    {/* Expanded JSON View */}
                    {expandedDocs.has(doc._id) && (
                      <div className='border-t border-border bg-muted/30 p-3'>
                        <pre className='max-h-[400px] overflow-auto rounded bg-muted p-3 text-xs leading-relaxed'>
                          {JSON.stringify(doc, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingDoc}
        onOpenChange={() => setDeletingDoc(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this document from the{' '}
              <span className='font-semibold text-foreground'>{tableName}</span>{' '}
              table? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletingDoc && (
            <div className='max-h-[200px] overflow-auto rounded-lg bg-muted p-3'>
              <pre className='whitespace-pre-wrap text-xs'>
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(deletingDoc).filter(([key]) => key !== '_id')
                  ),
                  null,
                  2
                ).slice(0, 500)}
                {JSON.stringify(deletingDoc).length > 500 ? '...' : ''}
              </pre>
            </div>
          )}
          <div className='flex gap-2'>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
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
                  Delete Document
                </>
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
