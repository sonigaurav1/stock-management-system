/* eslint-disable import/no-unresolved */
import { useState } from 'react';
import { amountToWords, formatDate, getCurrentTime } from '@/lib/utils';
import { ADToBS } from 'bikram-sambat-js';
import {
  DEFAULT_UNIT,
  TEST_COMPANY_DETAILS,
  VAT_PERCENTAGE
} from '../constants';
import type { InvoiceItem } from '../interfaces/IBilling';
import type { Id } from 'convex/_generated/dataModel';
import { toast } from 'sonner';
import { generatePaymentNote } from '../utils/utils';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useCustomerManagement } from './useCustomerManagement';
import { useAuthenticatedMutation } from '@/features/auth/utils/auth';
import { restrictedUser } from '@/features/products/constants/restrictedUserData';

export const useInvoiceProcessing = (user: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedInvoiceData, setProcessedInvoiceData] = useState<{
    totalAmount?: number;
    items?: InvoiceItem[];
    [key: string]: any;
  } | null>(null);

  const createSale = useMutation(api.sales.createSale);
  const applySaleStockDeduction = useMutation(
    api.locations.applySaleStockDeduction
  );
  const defaultLocation = useQuery(api.locations.getDefaultLocation);
  const createPayment = useAuthenticatedMutation(api.payments.createPayment);
  const createInvoice = useMutation(api.billing.createInvoice);

  const company = useQuery(api.companies.getCompany, {
    userId: user?.id as string
  });

  const { handleCustomerManagement } = useCustomerManagement();

  const processInvoice = (values: any, state: any, totalValue: number) => {
    // Convert selected products to the format expected by the form schema
    const items: (InvoiceItem & { productId: string })[] =
      state.selectedProducts.map((product: any, index: number) => ({
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

    const enrichedValues = {
      ...values,
      buyerName: values.buyerName.toUpperCase(),
      buyerAddress: values.buyerAddress.toUpperCase(),
      buyerPan: values.buyerPan,
      items,

      ...(user?.id === restrictedUser.id
        ? { ...TEST_COMPANY_DETAILS }
        : company
          ? {
              companyName: company?.name,
              companyAddress: company?.address,
              phone: (company?.phone as string[])?.join(', '),
              email: company?.email,
              vatNumber: company?.taxNumber,
              processedBy: company?.processedBy
            }
          : { ...TEST_COMPANY_DETAILS }),
      isTestUser: user?.id === restrictedUser.id,

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

    setProcessedInvoiceData(enrichedValues);
    setIsModalOpen(true);

    return enrichedValues;
  };

  const handleSalesCreation = async (
    items: InvoiceItem[],
    customerDetails: any[],
    formValues: any
  ) => {
    const customerId = customerDetails[0]?.customerId as Id<'customers'>;
    const paymentMode = formValues.paymentMode;
    const isCredit = formValues.isCredit;
    const partiallyPaidAmount = Number(formValues.partiallyPaidAmount || 0);
    const totalAmount = processedInvoiceData?.totalAmount || 0;
    const saleIds: Id<'sales'>[] = [];

    // Create all sales
    for (const item of items) {
      try {
        const sale = await createSale({
          productId: item.productId ?? '',
          customerId: customerId,
          customerName: customerDetails[0]?.customerName,
          customerPhone: customerDetails[0]?.customerPhone,
          paymentStatus:
            isCredit && partiallyPaidAmount === 0
              ? 'unpaid'
              : isCredit && partiallyPaidAmount > 0
                ? 'partially_paid'
                : 'paid',
          quantitySold: item.quantity,
          sellingPrice: item.rate * 1.13,
          totalAmount: item.amount * 1.13,
          soldAt: Date.now(),
          ...(defaultLocation?._id ? { locationId: defaultLocation._id } : {})
        });

        if (sale) {
          saleIds.push(sale);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating sale:', error);
      }
    }

    // Create payment
    if (saleIds.length > 0) {
      let amountPaid = totalAmount;
      let outstandingBalance = 0;

      if (isCredit) {
        if (partiallyPaidAmount === 0) {
          amountPaid = 0;
          outstandingBalance = totalAmount;
        } else {
          amountPaid = partiallyPaidAmount;
          outstandingBalance = totalAmount - partiallyPaidAmount;
        }
      }

      await createPayment({
        saleIds,
        invoiceNumber: formValues.invoiceNumber,
        customerId: customerId,
        amountPaid: Number(amountPaid.toFixed(2)),
        outstandingBalance: Number(outstandingBalance.toFixed(2)),
        paymentMode: paymentMode,
        paymentReference: formValues.invoiceNumber || '',
        notes: generatePaymentNote({
          customerName:
            customerDetails[0]?.customerName || formValues.buyerName,
          invoiceNumber: formValues.invoiceNumber,
          paymentMode,
          onCredit: isCredit ?? false,
          amountPaid,
          outstandingBalance,
          totalAmount
        }),
        paymentStatus:
          formValues.isCredit && partiallyPaidAmount === 0
            ? 'unpaid'
            : formValues.isCredit && partiallyPaidAmount > 0
              ? 'partially_paid'
              : 'paid',
        paidAt: Date.now(),
        ...(formValues.dueDate ? { dueDate: formValues.dueDate } : {})
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error creating payment:', error);
      });

      toast.success(
        generatePaymentNote({
          customerName:
            customerDetails[0]?.customerName || formValues.buyerName,
          invoiceNumber: formValues.invoiceNumber,
          paymentMode,
          onCredit: isCredit ?? false,
          amountPaid,
          outstandingBalance,
          totalAmount
        }),
        { duration: 5000, position: 'top-right' }
      );
    }
  };

  const handleStockManagement = async (items: InvoiceItem[]) => {
    for (const item of items) {
      if (
        !item.productId ||
        (typeof item.productId === 'string' &&
          item.productId.startsWith('temp_'))
      ) {
        continue;
      }

      try {
        await applySaleStockDeduction({
          productId: item.productId as Id<'products'>,
          quantityDecremented: item.quantity,
          ...(defaultLocation?._id ? { locationId: defaultLocation._id } : {})
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Stock deduction failed:', error);
      }
    }
  };

  const handleConfirmActions = async () => {
    if (!processedInvoiceData) return;

    setIsProcessing(true);

    // Remove `productId` from items
    const sanitizedItems = (processedInvoiceData.items ?? []).map(
      (item: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { productId, ...rest } = item;
        return rest;
      }
    );

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

      if (!customerDetails) {
        throw new Error('Customer details could not be retrieved.');
      }

      // Manage sales
      if (processedInvoiceData.items && processedInvoiceData.items.length > 0) {
        await handleSalesCreation(
          processedInvoiceData.items,
          [
            {
              customerId: customerDetails.customerId,
              customerName: customerDetails.customerName,
              customerPhone: customerDetails.customerPhone || []
            }
          ],
          processedInvoiceData
        );
      }

      // Manage stock
      await handleStockManagement(processedInvoiceData.items ?? []);

      setIsModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error during confirmation actions:', error);
      alert(
        'An error occurred while processing the invoice. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    isProcessing,
    processedInvoiceData,
    processInvoice,
    handleConfirmActions
  };
};
