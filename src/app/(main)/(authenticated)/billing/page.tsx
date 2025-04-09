'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useReducer, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { formSchema } from '@/features/billing/schema/invoice.schema';
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
import {
  COMPANY_DETAILS,
  DEFAULT_UNIT,
  TEST_COMPANY_DETAILS,
  VAT_PERCENTAGE
} from '@/features/billing/constants';
import { initialState, reducer } from '@/features/billing/reducers/reducer';
import {
  handleProductSelect,
  handleQuantityChange,
  handleRateChange,
  handleRemoveProduct,
  useDebouncedSetSearchTerm
} from '@/features/billing/utils/handlers';
import {
  BuyerAddressField,
  // BuyerCreditAmountField,
  BuyerNameField,
  BuyerPanField,
  BuyerPhoneField,
  InvoiceNumberField,
  PaymentModeField
} from '@/features/billing/components/FormFields';
import ProductList from '@/features/billing/components/ProductList';
import ProductItem from '@/features/billing/components/ProductItem';
import type {
  InvoiceItem,
  InvoiceProps
} from '@/features/billing/interfaces/IBilling';
import type { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useCustomerManagement } from '@/features/billing/hooks/useCustomerManagement';
import { restrictedUser } from '@/features/products/constants/restrictedUserData';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from '@/features/billing/components/InvoiceDocument';
import AlertModal from '@/features/billing/components/BillingAction';
import PageContainer from '@/components/layout/PageContainer';
import { useUser } from '@clerk/clerk-react';
import SharePDFButton from '@/features/billing/components/ShareButtons';

// Lazy load the PDF viewer component
const PDFViewerNoSSR = dynamic(
  () => import('@/features/billing/components/PDFViewerComponent'),
  { ssr: false }
);

// Define the form values type based on the schema
type FormValues = z.infer<typeof formSchema>;

const ProductBilling = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [processedInvoiceData, setProcessedInvoiceData] =
    useState<FormValues | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  const { user } = useUser();

  const createSale = useMutation(api.billing.createSale);
  const getProductById = useMutation(api.billing.getProductByIdBilling);
  const updateProductStock = useMutation(api.billing.updateProductStock);

  // Invoice
  const createInvoice = useMutation(api.billing.createInvoice);

  const companyDetails = useQuery(api.companyDetails.getCompanyDetails, {
    userId: user?.id as string
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { handleCustomerManagement } = useCustomerManagement();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: '',
      paymentMode: 'CASH',
      buyerName: '',
      buyerAddress: '',
      buyerCreditAmount: '',
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

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Use debounced search to reduce API calls
  const debouncedSetSearchTerm = useDebouncedSetSearchTerm(dispatch);

  const { products, isFetching } = useProductQuery(
    { page: 1, pageSize: 4 },
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

  async function handleSalesCreation(
    items: InvoiceItem[],
    customerDetails: {
      customerId: Id<'customers'>;
      customerName: string;
      customerPhone: string[];
    }[]
  ) {
    for (const item of items) {
      await createSale({
        productId: item.productId as Id<'products'>,
        customerId: customerDetails[0]?.customerId as Id<'customers'>,
        customerName: customerDetails[0]?.customerName,
        customerPhone: customerDetails[0]?.customerPhone,
        quantitySold: item.quantity,
        sellingPrice: item.rate * 1.13,
        totalAmount: item.amount * 1.13,
        soldAt: Date.now()
      });
    }
  }

  async function handleStockManagement(items: InvoiceItem[]) {
    for (const item of items) {
      const product = await getProductById({
        id: item.productId as Id<'products'>
      });

      if (product) {
        const newStockLevel = (product.stockLevel ?? 0) - item.quantity;
        let stockStatus = 'in_stock';

        if (newStockLevel <= 0) {
          stockStatus = 'out_of_stock';
        } else if (newStockLevel <= (product.reorderLevel ?? 0)) {
          stockStatus = 'low_stock';
        }

        await updateProductStock({
          id: item.productId as Id<'products'>,
          updates: {
            stockLevel: newStockLevel,
            stockStatus: stockStatus as
              | 'in_stock'
              | 'low_stock'
              | 'out_of_stock'
          }
        });
      }
    }
  }

  // Form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    // eslint-disable-next-line no-console
    console.debug(values);

    // Convert selected products to the format expected by the form schema
    const items: (InvoiceItem & { productId: string })[] =
      state.selectedProducts.map((product, index) => ({
        productId: product.id,
        sn: index + 1,
        hsCode: '',
        description: product.name,
        quantity: product.quantity,
        unit: DEFAULT_UNIT,
        rate: product.rate / 1.13,
        amount: product.quantity * (product.rate / 1.13)
      }));

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
      items,

      ...(user?.id === restrictedUser.id
        ? { ...TEST_COMPANY_DETAILS }
        : companyDetails
          ? {
              companyName: companyDetails.companyName,
              companyAddress: companyDetails.companyAddress,
              phone: (companyDetails.phone as string[])?.join(', '),
              email: companyDetails.email,
              vatNumber: companyDetails.vatNumber,
              processedBy: companyDetails.processedBy
            }
          : { ...COMPANY_DETAILS }),
      isAdmin: user?.id !== restrictedUser.id,

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

    // Submit logic would go here
    setProcessedInvoiceData(enrichedValues);

    dispatch({ type: 'SET_GENERATING', payload: true });

    setIsModalOpen(true); // Open the modal after form submission
  }

  async function handleConfirmActions() {
    if (!processedInvoiceData) return;

    setIsProcessing(true); // Start loading

    // Remove `productId` from items
    const sanitizedItems = (processedInvoiceData.items ?? []).map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { productId, ...rest } = item as InvoiceItem & {
        productId: string;
      };
      return rest;
    });

    try {
      // Manage invoices
      await createInvoice({
        invoiceData: {
          userId: user?.id as string,
          transactionDate: processedInvoiceData.transactionDate || '',
          invoiceNumber: processedInvoiceData.invoiceNumber,
          date: processedInvoiceData.date || '',
          miti: processedInvoiceData.miti || '',
          isAdmin: user?.id !== restrictedUser.id,
          paymentMode: processedInvoiceData.paymentMode,
          buyerName: processedInvoiceData.buyerName,
          buyerAddress: processedInvoiceData.buyerAddress,
          buyerPhone: processedInvoiceData.buyerPhone,
          buyerPan: processedInvoiceData.buyerPan,
          items: sanitizedItems || [],
          value: processedInvoiceData.value ?? 0,
          discount: processedInvoiceData.discount ?? 0,
          nonTaxable: processedInvoiceData.nonTaxable ?? 0,
          taxableAmount: processedInvoiceData.taxableAmount ?? 0,
          vatAmount: processedInvoiceData.vatAmount ?? 0,
          totalAmount: processedInvoiceData.totalAmount ?? 0,
          amountInWords: processedInvoiceData.amountInWords || '',
          printDate: processedInvoiceData.printDate || '',
          printTime: processedInvoiceData.printTime || ''
        }
      });

      // Manage customers
      const customerDetails = await handleCustomerManagement({
        buyerName: processedInvoiceData.buyerName || '',
        buyerPhone: processedInvoiceData.buyerPhone || '',
        buyerAddress: processedInvoiceData.buyerAddress || '',
        buyerPan: processedInvoiceData.buyerPan || ''
      });

      // Ensure customerDetails is in the correct format
      if (!customerDetails) {
        throw new Error('Customer details could not be retrieved.');
      }

      // Manage sales
      if (processedInvoiceData.items && processedInvoiceData.items.length > 0) {
        await handleSalesCreation(processedInvoiceData.items as InvoiceItem[], [
          {
            customerId: customerDetails.customerId,
            customerName: customerDetails.customerName,
            customerPhone: customerDetails.customerPhone || []
          }
        ]);
      }

      // Manage stock
      await handleStockManagement(processedInvoiceData.items as InvoiceItem[]);

      setIsModalOpen(false); // Close the modal after actions are completed

      // form.reset(); // Reset the form
      // dispatch({ type: 'RESET_SELECTED_PRODUCTS' }); // Reset selected products
      // setProcessedInvoiceData(null); // Clear processed invoice data
      // dispatch({ type: 'SET_GENERATING', payload: false }); // Reset generating state
      // alert('Invoice generated successfully!'); // Show success message
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during confirmation actions:', error);
      alert(
        'An error occurred while processing the invoice. Please try again.'
      );
    } finally {
      setIsProcessing(false); // End loading
    }
  }

  // const sharePdfUrl = processedInvoiceData
  //   ? URL.createObjectURL(
  //       new Blob([JSON.stringify(processedInvoiceData)], {
  //         type: 'application/pdf'
  //       })
  //     )
  //   : '';
  // console.log(sharePdfUrl);
  // const sharePdfFileName = `Invoice_${processedInvoiceData?.buyerName}_${processedInvoiceData?.invoiceNumber}.pdf`;
  // const sharePdfTitle = `Invoice #${processedInvoiceData?.invoiceNumber} - ${processedInvoiceData?.buyerName}`;

  // Render component
  return (
    <PageContainer scrollable>
      <section className='flex h-[calc(100dvh-90px)] w-full flex-col justify-between gap-6 lg:flex-row'>
        {/* Left Section */}
        {/* Product Selection and Invoice Form */}
        <div className='w-full lg:w-1/2 lg:pr-4'>
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
                      products={products.map((product: any) => ({
                        id: product._id,
                        name: product.name,
                        imageUrl: product.imageUrl,
                        rate: product.sellingPrice,
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
                  handleQuantityChange={(productId: any, newQuantity: any) =>
                    handleQuantityChange(dispatch)(productId, newQuantity)
                  }
                  handleRateChange={handleRateChange(dispatch)}
                  handleRemoveProduct={handleRemoveProduct(dispatch)}
                  className='flex flex-col sm:flex-row'
                />
              ))
            )}
          </div>

          <h3 className='mb-2 font-medium'>Invoice Details</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <InvoiceNumberField control={form.control} />
                <PaymentModeField control={form.control} />
                <BuyerNameField control={form.control} />
                {/* {form.getValues('paymentMode') === 'CREDIT' && (
                  <BuyerCreditAmountField control={form.control} />
                )} */}
                <BuyerAddressField control={form.control} />
                <BuyerPhoneField control={form.control} />
                <BuyerPanField control={form.control} />
              </div>

              <div className='s flex w-full items-center justify-between gap-4'>
                <Button
                  type='submit'
                  className='w-full py-5 sm:w-auto'
                  disabled={state.selectedProducts.length === 0}
                >
                  Generate Invoice
                </Button>

                {/* Invoice PDF */}
                {state.isGenerating && processedInvoiceData && (
                  <>
                    {/* Download PDF Button */}
                    <Button
                      asChild
                      className='w-full py-5 text-center sm:w-auto'
                    >
                      <PDFDownloadLink
                        document={
                          <InvoiceDocument
                            invoiceData={
                              processedInvoiceData as InvoiceProps['invoiceData']
                            }
                          />
                        }
                        fileName={`Invoice_${processedInvoiceData.buyerName}_${processedInvoiceData.invoiceNumber}.pdf`}
                      >
                        {({ loading }) =>
                          loading ? 'Loading...' : 'Download PDF'
                        }
                      </PDFDownloadLink>
                    </Button>

                    {/* Print Button */}
                    <Button
                      className='w-full py-5 sm:w-auto'
                      onClick={async () => {
                        try {
                          // Show loading state
                          setIsLoading(true);

                          const { pdf } = await import('@react-pdf/renderer');
                          const blob = await pdf(
                            <InvoiceDocument
                              invoiceData={
                                processedInvoiceData as InvoiceProps['invoiceData']
                              }
                            />
                          ).toBlob();

                          const url = URL.createObjectURL(blob);
                          const printWindow = window.open(url, '_blank');

                          if (printWindow) {
                            printWindow.focus();
                            printWindow.print();
                            // Clean up the blob URL after printing
                            printWindow.onafterprint = () => {
                              URL.revokeObjectURL(url);
                            };
                          } else {
                            // Handle popup blocker case
                            alert(
                              'Please allow popups for this website to print invoices.'
                            );
                            URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          // eslint-disable-next-line no-console
                          console.error('Error generating PDF:', error);
                          // Show user-friendly error message
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Print Invoice'}
                    </Button>
                  </>
                )}
              </div>

              {isMobile && (
                <div className='mt-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>Total Amount:</span>{' '}
                    {totalValue.toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>VAT:</span>{' '}
                    {(totalValue * VAT_PERCENTAGE).toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>NET TOTAL:</span>{' '}
                    {(totalValue * 1.13).toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>Amount in Words:</span>{' '}
                    {amountToWords(totalValue * 1.13)}
                  </p>
                </div>
              )}
            </form>
            {state.isGenerating && processedInvoiceData && (
              <div className='mt-4 flex w-full items-center justify-between gap-4'>
                {/* Share PDF Button */}
                {/* <SharePdfButton
                      pdfUrl={async () => {
                        const { pdf } = await import('@react-pdf/renderer');
                        const blob = await pdf(
                          <InvoiceDocument
                            invoiceData={
                              processedInvoiceData as InvoiceProps['invoiceData']
                            }
                          />
                        ).toBlob();

                        return URL.createObjectURL(blob);
                      }}
                      title={sharePdfTitle}
                      fileName={sharePdfFileName}
                    /> */}
                <SharePDFButton
                  invoiceData={
                    processedInvoiceData as InvoiceProps['invoiceData']
                  }
                />
              </div>
            )}
          </Form>
        </div>

        {/* Right Section */}
        {/* PDF Viewer */}
        <div className='h-full w-full border-t pb-24 pt-4 md:pb-0 lg:w-1/2 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0'>
          {state.isGenerating && processedInvoiceData ? (
            isMobile ? (
              <div className='flex flex-col items-center justify-center space-y-4 p-4'>
                <p className='text-center text-gray-600'>
                  PDF preview is not available on mobile devices. You can
                  download the invoice instead.
                </p>

                <PDFDownloadLink
                  document={
                    <InvoiceDocument
                      invoiceData={
                        processedInvoiceData as InvoiceProps['invoiceData']
                      }
                    />
                  }
                  fileName={`Invoice_${processedInvoiceData.buyerName}_${processedInvoiceData.invoiceNumber}.pdf`}
                  className='w-full'
                >
                  {({ loading }) => (
                    <Button className='w-full' disabled={loading}>
                      {loading
                        ? 'Preparing document...'
                        : 'Download Invoice PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            ) : (
              <div className='h-full'>
                <PDFViewerNoSSR
                  invoiceData={
                    processedInvoiceData as InvoiceProps['invoiceData']
                  }
                />
              </div>
            )
          ) : (
            <div className='flex h-[400px] items-center justify-center rounded-md bg-gray-200 sm:h-[500px] md:h-[600px] lg:h-full'>
              <p className='text-gray-500'>No invoice generated</p>
            </div>
          )}
        </div>
        {/* Alert Modal */}
      </section>

      <AlertModal
        isOpen={isModalOpen}
        onConfirm={isProcessing ? () => {} : handleConfirmActions} // Disable confirm button while processing
        onCancel={() => !isProcessing && setIsModalOpen(false)} // Prevent cancel during processing
        title='Confirm Invoice Actions'
        description={
          isProcessing
            ? 'Processing actions, please wait...'
            : 'Are you sure you want to manage customers, sales, and stock for this invoice?'
        }
      />
    </PageContainer>
  );
};

export default ProductBilling;
