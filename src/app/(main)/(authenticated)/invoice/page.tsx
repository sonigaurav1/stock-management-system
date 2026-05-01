'use client';

import PageContainer from '@/components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useMemo, useState } from 'react';
import {
  Eye,
  Download,
  Trash2,
  FileText,
  DollarSign,
  Package,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const InvoicePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const invoices = useQuery(api.billing.getAllInvoices) ?? [];

  const filteredInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [invoices, searchTerm]
  );

  const invoiceStats = useMemo(() => {
    return {
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce(
        (sum, inv) => sum + (inv.totalAmount ?? 0),
        0
      ),
      averageInvoiceValue:
        invoices.length > 0
          ? invoices.reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0) /
            invoices.length
          : 0
    };
  }, [invoices]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col gap-4 pb-6'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <FileText className='size-5 text-primary' />
            <h1 className='text-2xl font-bold tracking-tight'>Invoices</h1>
          </div>
          <p className='text-sm text-muted-foreground'>
            Manage and track all your sales invoices in one place. Search by
            invoice number or customer name.
          </p>
        </div>

        <Separator />

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Total Invoices</span>
                <Package className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                {invoiceStats.totalInvoices}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Total Revenue</span>
                <DollarSign className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                Rs. {(invoiceStats.totalRevenue || 0).toFixed(0)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardDescription className='flex items-center justify-between'>
                <span>Average Invoice</span>
                <Calendar className='size-4 text-muted-foreground' />
              </CardDescription>
              <CardTitle className='text-2xl'>
                Rs. {(invoiceStats.averageInvoiceValue || 0).toFixed(0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              Invoice List
              <div className='w-64'>
                <Input
                  placeholder='Search invoice #, customer...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='h-8'
                />
              </div>
            </CardTitle>
            <CardDescription>
              {filteredInvoices.length} invoice
              {filteredInvoices.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className='rounded-lg border border-dashed p-8 text-center'>
                <FileText className='mx-auto mb-2 size-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>
                  {searchTerm
                    ? 'No invoices match your search'
                    : 'No invoices created yet'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className='font-medium'>
                          <Badge variant='outline'>
                            {invoice.invoiceNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {invoice.buyerName}
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className='font-semibold'>
                          Rs. {(invoice.totalAmount ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className='text-center text-sm'>
                          {invoice.items?.length ?? 0}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Link
                              href={`/billing/invoice/${invoice.invoiceNumber}`}
                              title='View Invoice'
                            >
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0'
                              >
                                <Eye className='size-4' />
                              </Button>
                            </Link>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-8 w-8 p-0'
                              title='Download PDF'
                            >
                              <Download className='size-4' />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                              title='Delete Invoice'
                            >
                              <Trash2 className='size-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default InvoicePage;
