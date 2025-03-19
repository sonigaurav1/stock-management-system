'use client';
import { api } from '@/../convex/_generated/api';
import { useMutation } from 'convex/react';
import { useCallback } from 'react';

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

        // First, directly query if this customer exists using the current values
        const existingCustomer = await initialCustomerCheck({
          phone: buyerPhone || '',
          pan: buyerPan || ''
        });

        // Only create if no customer was found
        if (!existingCustomer) {
          await createCustomer({
            name: values.buyerName,
            phone: values.buyerPhone,
            address: values.buyerAddress,
            pan: values.buyerPan,
            createdAt: Date.now()
          });
          return { created: true };
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
