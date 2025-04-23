'use client';

import { useState, useMemo, useReducer, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Info } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import CustomTooltip from '@/components/ui/custom/CustomTooltip';
import PageContainer from '@/components/layout/PageContainer';
import { useProductQuery } from '@/features/products/hooks/useProductQuery';
import { initialState, reducer } from '@/features/billing/reducers/reducer';
import {
  handleProductSelect,
  handleQuantityChange,
  handleRateChange,
  handleRemoveProduct,
  useDebouncedSetSearchTerm
} from '@/features/billing/utils/handlers';
import { QuickProductForm } from '@/features/billing/components/QuickAddProductForm';
import AlertModal from '@/features/billing/components/BillingAction';
import { ProductSearch } from '@/features/billing/components/ProductSearch';
import SelectedProductsList from '@/features/billing/components/SelectedProductsList';
import InvoiceForm from '@/features/billing/components/InvoiceForm';
import { PDFActionButtons } from '@/features/billing/components/PDFActionButtons';
import PDFPreviewContainer from '@/features/billing/components/PDFPreviewContainer';
import { useInvoiceProcessing } from '@/features/billing/hooks/useInvoiceProcessing';
import { useDebounce } from '@/hooks/useDebounce';

const ProductBilling = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading] = useState(false);

  const { user } = useUser();
  const categories = useQuery(api.categories.getAllCategories);
  const debouncedSetSearchTerm = useDebouncedSetSearchTerm(dispatch);

  const {
    isModalOpen,
    setIsModalOpen,
    isProcessing,
    processedInvoiceData,
    processInvoice,
    handleConfirmActions
  } = useInvoiceProcessing(user);

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

  const { products, isFetching } = useProductQuery(
    { page: 1, pageSize: 4 },
    { searchTerm: useDebounce(state.searchTerm, 300) }
  );

  const { products: memoizedProducts } = useMemo(() => {
    return {
      products: products
    };
  }, [products]);

  // Memoize calculations for selected products
  const totalValue = useMemo(
    () =>
      state.selectedProducts.reduce(
        (sum, product) => sum + product.quantity * (product.rate / 1.13),
        0
      ),
    [state.selectedProducts]
  );

  const addProduct = (product: any) => {
    const productHandler = handleProductSelect(
      dispatch,
      debouncedSetSearchTerm
    );
    productHandler({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl || '',
      quantity: 1,
      rate: product.sellingPrice || 0,
      stockLevel: product.stockLevel
    });
  };

  // Form submission
  function onSubmit(values: any) {
    processInvoice(values, state, totalValue);
    dispatch({ type: 'SET_GENERATING', payload: true });
  }

  return (
    <>
      <PageContainer scrollable>
        <div className='flex h-full w-full flex-col space-y-4'>
          <section className='flex h-[calc(100dvh-100px)] min-h-max w-full flex-col justify-between gap-6 lg:flex-row'>
            {/* Left Section */}
            <div className='w-full lg:w-1/2 lg:pr-4'>
              <div className='space-y-2'>
                <Heading
                  title='Billing'
                  description='Create and manage invoices, sales, customer and stock.'
                />
                <Separator />
              </div>

              <div className='mb-2 mt-4 flex items-center justify-between'>
                <p className='-mb-4 text-lg'>Add Product</p>
                <div className='flex items-center space-x-2'>
                  <QuickProductForm
                    categories={
                      categories?.map((category) => ({
                        _id: category._id,
                        name: category.name
                      })) || []
                    }
                    onAddProduct={addProduct}
                  />
                  <CustomTooltip
                    triggerElement={<Info className='size-4' />}
                    tooltipContent={
                      'The Quick Product Form lets you add new inventory items without leaving the billing page.'
                    }
                    delayDuration={0}
                    triggerClassName='max-w-64 truncate'
                    contentClassName='max-w-96'
                  />
                </div>
              </div>

              <ProductSearch
                searchTerm={state.searchTerm}
                dispatch={dispatch}
                products={memoizedProducts}
                isFetching={isFetching}
                handleProductSelect={handleProductSelect(
                  dispatch,
                  debouncedSetSearchTerm
                )}
              />

              <h3 className='mb-2 font-medium'>
                Selected Products ({state.selectedProducts.length})
              </h3>

              <SelectedProductsList
                products={state.selectedProducts}
                handleQuantityChange={(productId, newQuantity) =>
                  handleQuantityChange(dispatch)(productId, newQuantity)
                }
                handleRateChange={handleRateChange(dispatch)}
                handleRemoveProduct={handleRemoveProduct(dispatch)}
              />

              <h3 className='mb-2 font-medium'>Invoice Details</h3>

              <InvoiceForm
                onSubmit={onSubmit}
                selectedProductsCount={state.selectedProducts.length}
                isGenerating={state.isGenerating}
                processedInvoiceData={processedInvoiceData}
                totalValue={totalValue}
                isMobile={isMobile}
                isLoading={isLoading}
                dispatch={dispatch}
              >
                {state.isGenerating && processedInvoiceData && (
                  <PDFActionButtons
                    processedInvoiceData={processedInvoiceData}
                    isMobile={isMobile}
                  />
                )}
              </InvoiceForm>

              {isMobile && (
                <div className='mt-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>Total: </span>
                    {totalValue.toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>VAT: </span>
                    {(totalValue * 0.13).toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    <span className='font-medium'>NET: </span>
                    {(totalValue * 1.13).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Right Section - PDF Viewer */}
            <PDFPreviewContainer
              isGenerating={state.isGenerating}
              processedInvoiceData={processedInvoiceData}
              isMobile={isMobile}
            />
          </section>
        </div>
      </PageContainer>

      {/* Alert Modal */}
      <AlertModal
        isOpen={isModalOpen}
        onConfirm={isProcessing ? () => {} : handleConfirmActions}
        onCancel={() => !isProcessing && setIsModalOpen(false)}
        title='Confirm Invoice Actions'
        description={
          isProcessing
            ? 'Processing actions, please wait...'
            : 'Are you sure you want to manage customers, sales, and stock for this invoice?'
        }
      />
    </>
  );
};

export default ProductBilling;
