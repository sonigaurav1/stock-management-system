import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { formSchema } from '../schema/invoice.schema';
import {
  BuyerAddressField,
  BuyerNameField,
  BuyerPanField,
  BuyerPartialPaidAmountField,
  BuyerPhoneField,
  DueDateField,
  InvoiceNumberField,
  IsCreditField,
  PaymentModeField
} from './FormFields';
import { useEffect } from 'react';

type FormProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  selectedProductsCount: number;
  isGenerating: boolean;
  processedInvoiceData: any;
  totalValue: number;
  isMobile: boolean;
  isLoading: boolean;
  children?: React.ReactNode;
  dispatch?: React.Dispatch<any>;
};

const InvoiceForm = ({
  onSubmit,
  selectedProductsCount,
  children,
  dispatch
}: FormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: '',
      paymentMode: 'CASH',
      buyerName: '',
      buyerAddress: '',
      partiallyPaidAmount: '',
      buyerPhone: '',
      buyerPan: '',
      isCredit: false,
      dueDate: 0
    }
  });

  // Watch only the isCredit field instead of all fields
  const isCredit = useWatch({
    control: form.control,
    name: 'isCredit',
    defaultValue: false
  });

  // Separate effect for handling PDF generation state reset
  useEffect(() => {
    // Create a list of fields that should trigger PDF reset
    const fieldsThatResetPDF = [
      'invoiceNumber',
      'paymentMode',
      'buyerName',
      'buyerAddress',
      'buyerPhone',
      'buyerPan',
      'partiallyPaidAmount'
    ];

    const subscription = form.watch((values, { name }) => {
      // Only dispatch if a field that should reset PDF changes
      if (dispatch && name && fieldsThatResetPDF.includes(name)) {
        dispatch({ type: 'SET_GENERATING', payload: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <InvoiceNumberField control={form.control} />
          <PaymentModeField control={form.control} />
          <BuyerNameField control={form.control} />
          <BuyerAddressField control={form.control} />
          <BuyerPhoneField control={form.control} />
          <BuyerPanField control={form.control} />
          {isCredit && (
            <>
              <BuyerPartialPaidAmountField control={form.control} />
              <DueDateField control={form.control} />
            </>
          )}
        </div>
        <IsCreditField control={form.control} />

        <div className='grid w-full grid-cols-3 items-center justify-between gap-4'>
          <Button
            type='submit'
            className='w-full text-nowrap py-5 sm:w-auto'
            disabled={selectedProductsCount === 0}
          >
            Generate Invoice
          </Button>
          {children}
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;
