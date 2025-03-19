'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useReducer, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import { formSchema } from './schema/invoice.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProductQuery } from '@/features/products/hooks/useProductQuery';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Command, CommandList } from '@/components/ui/command';
import { SearchIcon } from 'lucide-react';

import { amountToWords, formatDate, getCurrentTime } from '@/lib/utils';
import { ADToBS } from 'bikram-sambat-js';
import ProductItem from './_components/ProductItem';
import { InvoiceItem } from './interfaces/IBilling';
import { COMPANY_DETAILS, DEFAULT_UNIT, VAT_PERCENTAGE } from './constants';
import { initialState, reducer } from './reducers/reducer';
import {
  handleProductSelect,
  handleQuantityChange,
  handleRateChange,
  handleRemoveProduct,
  useDebouncedSetSearchTerm
} from './utils/handlers';
import {
  BuyerAddressField,
  BuyerNameField,
  BuyerPanField,
  BuyerPhoneField,
  InvoiceNumberField,
  PaymentModeField
} from './_components/FormFields';
import ProductList from './_components/ProductList';

// Lazy load the PDF viewer component
const PDFViewerNoSSR = dynamic(
  () => import('./_components/PDFViewerComponent'),
  { ssr: false }
);

// Define the form values type based on the schema
type FormValues = z.infer<typeof formSchema>;

const ProductBilling = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [processedInvoiceData, setProcessedInvoiceData] =
    useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: '',
      paymentMode: 'CASH',
      buyerName: '',
      buyerAddress: '',
      buyerPhone: '',
      buyerPan: ''
    }
  });

  // Use effect to listen for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (state.isGenerating) {
        dispatch({ type: 'SET_GENERATING', payload: false });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, state.isGenerating]);

  // Use debounced search to reduce API calls
  const debouncedSetSearchTerm = useDebouncedSetSearchTerm(dispatch);

  const { products, isFetching } = useProductQuery(
    { page: 1, pageSize: 10 },
    { searchTerm: state.searchTerm }
  );

  // Memoize calculations for selected products
  const totalValue = useMemo(
    () =>
      state.selectedProducts.reduce(
        (sum, product) => sum + product.quantity * (product.rate / 1.13),
        0
      ),
    [state.selectedProducts]
  );

  // Form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Log form errors to the console
    if (Object.keys(form.formState.errors).length > 0) {
      // eslint-disable-next-line no-console
      console.error('Form validation errors:', form.formState.errors);
      return;
    }

    // Convert selected products to the format expected by the form schema
    const items: InvoiceItem[] = state.selectedProducts.map(
      (product, index) => ({
        sn: index + 1,
        hsCode: '',
        description: product.name,
        quantity: product.quantity,
        unit: DEFAULT_UNIT,
        rate: product.rate / 1.13,
        amount: product.quantity * (product.rate / 1.13)
      })
    );

    const discount = values.discount || 0;
    const nonTaxable = values.nonTaxable || 0;
    const taxableAmount = totalValue - nonTaxable - discount;
    const vatAmount = taxableAmount * VAT_PERCENTAGE;
    const totalAmount = taxableAmount + vatAmount + nonTaxable;

    const bsDate = ADToBS(formatDate(new Date()));

    const enrichedValues: FormValues = {
      ...values,
      buyerName: values.buyerName.toUpperCase(),
      buyerAddress: values.buyerAddress.toUpperCase(),
      buyerPan: values.buyerPan,
      ...COMPANY_DETAILS,
      items,

      // Calculate other financial values as needed
      transactionDate: formatDate(new Date()),
      date: formatDate(new Date()),
      printDate: formatDate(new Date()),
      printTime: getCurrentTime(),
      miti: bsDate,
      value: totalValue > 0 ? totalValue : null,
      discount: totalValue > 0 ? discount : undefined,
      nonTaxable: totalValue > 0 ? nonTaxable : undefined,
      taxableAmount: taxableAmount > 0 ? taxableAmount : null,
      vatAmount: vatAmount > 0 ? vatAmount : null,
      totalAmount: totalAmount > 0 ? totalAmount : null,
      amountInWords: totalAmount > 0 ? amountToWords(totalAmount) : ''
    };

    // eslint-disable-next-line no-console
    console.debug(enrichedValues);

    // Submit logic would go here
    setProcessedInvoiceData(enrichedValues);

    dispatch({ type: 'SET_GENERATING', payload: true });
  }

  // Render component
  return (
    <section className='flex h-full w-full flex-col justify-between p-4 md:flex-row'>
      <div className='w-full overflow-y-auto pr-0 md:w-1/2 md:pr-4'>
        <h2 className='mb-4 text-xl font-semibold'>Add Product</h2>

        <div className='mb-6'>
          <Popover>
            <PopoverTrigger asChild>
              <div className='relative w-full'>
                <Input
                  value={state.searchTerm}
                  onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                  placeholder='Search for a product'
                  className='mb-2 w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                />
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400'>
                  <SearchIcon className='h-4 w-4' />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className='w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-gray-100 p-0 shadow-lg'
              sideOffset={5}
            >
              <Command className='w-full rounded-lg'>
                <div className='border-b border-gray-100'>
                  <div className='relative'>
                    <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                    <Input
                      className='w-full border-none py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:ring-0'
                      placeholder='Search for a product'
                      value={state.searchTerm}
                      onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <CommandList className='max-h-64 w-full overflow-auto'>
                  <ProductList
                    products={products.map((product) => ({
                      id: product._id,
                      name: product.name,
                      imageUrl: product.imageUrl,
                      rate: product.sellingPrice,
                      quantity: 1,
                      ...(product as any)
                    }))}
                    isFetching={isFetching}
                    handleProductSelect={handleProductSelect(
                      dispatch,
                      debouncedSetSearchTerm
                    )}
                  />
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <h3 className='mb-2 font-medium'>
          Selected Products ({state.selectedProducts.length})
        </h3>
        <div className='mb-6 space-y-4'>
          {state.selectedProducts.length === 0 ? (
            <p className='text-sm text-gray-500'>No products selected</p>
          ) : (
            state.selectedProducts.map((product, index) => (
              <ProductItem
                key={`${product.id}-${index}`}
                product={product}
                index={index}
                handleQuantityChange={handleQuantityChange(dispatch)}
                handleRateChange={handleRateChange(dispatch)}
                handleRemoveProduct={handleRemoveProduct(dispatch)}
              />
            ))
          )}
        </div>

        <h3 className='mb-2 font-medium'>Invoice Details</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <InvoiceNumberField control={form.control} />
              <PaymentModeField control={form.control} />
              <BuyerNameField control={form.control} />
              <BuyerAddressField control={form.control} />
              <BuyerPhoneField control={form.control} />
              <BuyerPanField control={form.control} />
            </div>
            <Button
              type='submit'
              onClick={() => {
                onSubmit(form.getValues());
              }}
              className='w-full'
            >
              Generate Invoice
            </Button>
          </form>
        </Form>
      </div>
      <div className='w-full border-t pl-0 pt-4 md:w-1/2 md:border-l md:border-t-0 md:pl-4 md:pt-0'>
        {state.isGenerating ? (
          <PDFViewerNoSSR invoiceData={processedInvoiceData} />
        ) : (
          <div className='flex h-full items-center justify-center rounded-md bg-gray-200'>
            <p className='text-gray-500'>No invoice generated</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductBilling;
