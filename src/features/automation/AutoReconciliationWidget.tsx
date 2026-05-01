'use client';

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
import { AlertCircle, CheckCircle2, Loader2, RotateCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useState } from 'react';

export default function AutoReconciliationWidget() {
  const reconciliationData = useQuery(
    api.automation.matchTransactionsWithInvoices
  );
  const confirmMatch = useMutation(api.automation.confirmReconciliation);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirmMatch = async (
    transactionId: string,
    invoiceId?: string
  ) => {
    setConfirmingId(transactionId);
    try {
      await confirmMatch({
        transactionId,
        invoiceId,
        matchType: 'exact'
      });
    } catch (error) {
      console.error('Failed to confirm:', error);
    } finally {
      setConfirmingId(null);
    }
  };

  if (reconciliationData === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
      </div>
    );
  }

  const {
    exactMatches = 0,
    closeMatches = 0,
    unmatched = 0,
    summary = {},
    matches = [],
    closeMatchesList = []
  } = reconciliationData || {};

  return (
    <div className='space-y-6'>
      {/* Reconciliation Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-green-600'>
                {exactMatches}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Exact Matches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold text-yellow-600'>
                {closeMatches}
              </p>
              <p className='mt-1 text-sm text-gray-600'>Close Matches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>
                {reconciliationData?.summary?.reconciliablePercentage}%
              </p>
              <p className='mt-1 text-sm text-gray-600'>Reconciliation Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exact Matches */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            Matched Transactions
          </CardTitle>
          <CardDescription>
            Transactions that have been matched with invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className='py-8 text-center text-gray-500'>No matches found</p>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Matched With</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.slice(0, 5).map((match: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-mono text-sm'>
                        {match.transactionId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        ₹{match.amount}
                      </TableCell>
                      <TableCell className='text-sm'>Invoice</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='bg-green-50'>
                          perfect
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Close Matches Needing Review */}
      {closeMatchesList && closeMatchesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <RotateCw className='h-5 w-5 text-yellow-600' />
              Matches Pending Review
            </CardTitle>
            <CardDescription>
              {closeMatchesList.length} transactions with partial matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead className='text-right'>Tx Amount</TableHead>
                    <TableHead className='text-right'>Invoice Amount</TableHead>
                    <TableHead className='text-right'>Difference</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closeMatchesList
                    .slice(0, 5)
                    .map((match: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className='font-mono text-sm'>
                          {match.transactionId.slice(0, 8)}...
                        </TableCell>
                        <TableCell className='text-right'>
                          ₹{match.transactionAmount}
                        </TableCell>
                        <TableCell className='text-right'>
                          ₹{match.paymentAmount}
                        </TableCell>
                        <TableCell className='text-right text-yellow-600'>
                          {match.amountDiffPercent?.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              handleConfirmMatch(
                                match.transactionId,
                                match.paymentId
                              )
                            }
                            disabled={confirmingId === match.transactionId}
                          >
                            {confirmingId === match.transactionId ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              'Confirm'
                            )}
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

      {/* How It Works */}
      <Card className='border-purple-200 bg-purple-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <AlertCircle className='h-5 w-5 text-purple-600' />
            How Auto-Reconciliation Works
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white'>
              1
            </div>
            <p>System scans all transactions and invoices</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white'>
              2
            </div>
            <p>Matches based on amount and date within tolerance</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white'>
              3
            </div>
            <p>Exact matches are automatically confirmed</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white'>
              4
            </div>
            <p>Close matches flagged for your review</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
