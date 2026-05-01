'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceForm from './InvoiceForm';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * InvoiceGenerator Component
 *
 * Provides a centralized interface for:
 * - Creating new invoices from scratch
 * - Converting sales orders to invoices
 * - Managing invoice templates
 *
 * Features:
 * - Auto-incrementing invoice numbers
 * - Customer & product selection
 * - Multiple payment modes
 * - Real-time calculations
 */
const InvoiceGenerator = () => {
  const [selectedProductsCount, setSelectedProductsCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const handleInvoiceSubmit = async (values: any) => {
    try {
      setIsGenerating(true);
      // Handle invoice generation logic here
      console.debug('Invoice data:', values);
      // TODO: Call API to create invoice and handle response
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='create' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='create' className='gap-2'>
            <Plus className='h-4 w-4' />
            Create Invoice
          </TabsTrigger>
          <TabsTrigger value='from-order' className='gap-2'>
            <FileText className='h-4 w-4' />
            From Sales Order
          </TabsTrigger>
        </TabsList>

        <TabsContent value='create' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>New Invoice</CardTitle>
              <CardDescription>
                Create a new invoice with auto-incremented invoice number and
                tax calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceForm
                onSubmit={handleInvoiceSubmit}
                selectedProductsCount={selectedProductsCount}
                isGenerating={isGenerating}
                processedInvoiceData={null}
                totalValue={totalValue}
                isMobile={false}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='from-order' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Generate from Sales Order</CardTitle>
              <CardDescription>
                Select an existing sales order to convert it into an invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <FileText className='mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-semibold'>
                  No Sales Orders Available
                </h3>
                <p className='mb-4 max-w-sm text-sm text-muted-foreground'>
                  You don't have any pending sales orders. Create sales orders
                  first to generate invoices from them.
                </p>
                <Button variant='outline' disabled>
                  Browse Sales Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Info */}
      <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'>
        <CardHeader>
          <CardTitle className='text-base'>
            💡 Invoice Generation Tips
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <ul className='list-inside list-disc space-y-1'>
            <li>
              Invoice numbers are auto-incremented based on your company
              settings
            </li>
            <li>
              VAT is automatically calculated based on the tax configuration
            </li>
            <li>
              Supports multiple payment modes: cash, credit, debit, bank
              transfer
            </li>
            <li>You can save draft invoices and edit them before finalizing</li>
            <li>Use the share button to send invoices via email or WhatsApp</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;
