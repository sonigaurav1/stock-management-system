'use client';
import { api } from '@/../convex/_generated/api';
import { useMutation } from 'convex/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface FormValues {
  buyerName: string;
  buyerPhone: string;
  buyerPan?: string;
  buyerAddress: string;
}

export const useCustomerManagement = () => {
  const createCustomer = useMutation(api.documents.createCustomer);

  // This query will only be used for initial rendering
  const initialCustomerCheck = useMutation(
    api.documents.getCustomerByPanOrPhone
  );

  const handleCustomerManagement = useCallback(
    async (values: FormValues) => {
      try {
        const { buyerPhone, buyerPan } = values;
        if (!buyerPhone && !buyerPan) {
          toast.warning('Validation Error', {
            description: 'Phone Number or PAN Number is required'
          });
          return;
        }

        const phones = buyerPhone.split('/') ?? [];

        // First, directly query if this customer exists using the current values
        const existingCustomer = await initialCustomerCheck({
          phones: phones,
          pan: buyerPan || ''
        });

        // Only create if no customer was found
        if (!existingCustomer) {
          const customerId = await createCustomer({
            name: values.buyerName,
            phone: phones,
            address: values.buyerAddress,
            pan: values.buyerPan,
            createdAt: Date.now()
          });
          return { customerId, created: true };
        }

        return { created: false, existingCustomer };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error managing customer:', error);
        throw new Error(`Error managing customer: ${error}`);
      }
    },
    [createCustomer, initialCustomerCheck]
  );

  return {
    handleCustomerManagement,
    isLoading: initialCustomerCheck === undefined
  };
};
