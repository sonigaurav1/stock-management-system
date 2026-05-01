'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function DuplicateDetectionWidget() {
  const [entityType, setEntityType] = useState<
    'sales' | 'payments' | 'transactions' | 'invoices'
  >('sales');
  const duplicateData = useQuery(api.automation.detectDuplicateRecords, {
    entityType
  });
  const resolveDuplicate = useMutation(api.automation.resolveDuplicate);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (
    record1Id: string,
    record2Id: string,
    resolution: 'delete_record2' | 'merge' | 'false_positive'
  ) => {
    setResolvingId(record2Id);
    try {
      await resolveDuplicate({
        record1Id,
        record2Id,
        entityType,
        resolution
      });
    } catch (error) {
      console.error('Failed to resolve:', error);
    } finally {
      setResolvingId(null);
    }
  };

  if (duplicateData === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-red-600' />
      </div>
    );
  }

  const {
    confirmedDuplicates = [],
    suspiciousDuplicates = [],
    summary = {
      confirmed: 0,
      needsReview: 0,
      estimatedFinancialImpact: '0'
    },
    totalRecords = 0
  } = (duplicateData as any) || {};

  // Ensure arrays are properly typed
  const confirmedDups = (
    Array.isArray(confirmedDuplicates) ? confirmedDuplicates : []
  ) as any[];
  const suspiciousDups = (
    Array.isArray(suspiciousDuplicates) ? suspiciousDuplicates : []
  ) as any[];

  return (
    <div className='space-y-6'>
      {/* Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Entity Type</CardTitle>
          <CardDescription>
            Choose what type of records to scan for duplicates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={entityType}
            onValueChange={(v) => setEntityType(v as any)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='sales'>Sales Orders</SelectItem>
              <SelectItem value='payments'>Payments</SelectItem>
              <SelectItem value='transactions'>Transactions</SelectItem>
              <SelectItem value='invoices'>Invoices</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Duplicate Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-red-600'>
                {confirmedDups?.length || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Confirmed Duplicates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-yellow-600'>
                {suspiciousDups?.length || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Suspicious</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>
                ₹{(summary.estimatedFinancialImpact as any) || 0}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Estimated Impact</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmed Duplicates */}
      {(confirmedDups?.length || 0) > 0 && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='h-5 w-5' />
              Confirmed Duplicates
            </CardTitle>
            <CardDescription>
              These records are identical and should be resolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record 1</TableHead>
                    <TableHead>Record 2</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmedDups.slice(0, 5).map((dup: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-mono text-sm'>
                        {dup.record1Id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {dup.record2Id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        ₹{dup.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant='destructive'>98%</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            handleResolve(
                              dup.record1Id,
                              dup.record2Id,
                              'delete_record2'
                            )
                          }
                          disabled={resolvingId === dup.record2Id}
                          className='gap-1'
                        >
                          {resolvingId === dup.record2Id ? (
                            <Loader2 className='h-3 w-3 animate-spin' />
                          ) : (
                            <Trash2 className='h-3 w-3' />
                          )}
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspicious Duplicates */}
      {(suspiciousDups?.length || 0) > 0 && (
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-yellow-700'>
              <AlertCircle className='h-5 w-5' />
              Suspicious Duplicates
            </CardTitle>
            <CardDescription>
              These records are similar but not exact matches. Review before
              acting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Record 1</TableHead>
                    <TableHead>Record 2</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead className='text-right'>Time Diff</TableHead>
                    <TableHead>Similarity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousDups.slice(0, 5).map((dup: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-mono text-sm'>
                        {dup.record1Id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {dup.record2Id?.slice(0, 8)}...
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        ₹{dup.amount}
                      </TableCell>
                      <TableCell className='text-right text-sm'>
                        {dup.timeDiffMinutes?.toFixed(0)} min
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>85%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clean Status */}
      {(confirmedDups?.length || 0) === 0 &&
        (suspiciousDups?.length || 0) === 0 && (
          <Card>
            <CardContent className='pb-12 pt-12 text-center'>
              <CheckCircle2 className='mx-auto mb-4 h-16 w-16 text-green-500' />
              <p className='text-lg font-semibold'>No duplicates detected</p>
              <p className='mt-2 text-gray-600'>
                Your {entityType} records are clean!
              </p>
            </CardContent>
          </Card>
        )}

      {/* How It Works */}
      <Card className='border-red-200 bg-red-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertCircle className='h-5 w-5 text-red-600' />
            How Duplicate Detection Works
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white'>
              1
            </div>
            <p>Scans for exact matches (same amount, customer, date)</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white'>
              2
            </div>
            <p>
              Identifies suspicious patterns (similar amounts within time
              window)
            </p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white'>
              3
            </div>
            <p>Presents confirmed and suspicious duplicates for review</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white'>
              4
            </div>
            <p>Allows you to delete duplicates or mark as false positives</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
