/* eslint-disable import/no-unresolved */
import React from 'react';
import { PAYMENT_METHODS } from '../constants';
import CustomInput from '@/components/form/CustomInput';
import CustomSelect from '@/components/form/CustomSelect';
import { useController } from 'react-hook-form';

export const InvoiceNumberField = ({ control }: { control: any }) => (
  <CustomInput
    name='invoiceNumber'
    label=' Invoice Number'
    placeHolder='Enter invoice number'
    required
  />
);

export const PaymentModeField = ({ control }: { control: any }) => (
  <CustomSelect
    name='paymentMode'
    placeholder='Select payment mode'
    options={PAYMENT_METHODS.map((method) => ({
      value: method,
      label: method
    }))}
    required
    label='Payment Mode'
    valueKey='method'
  />
);

export const BuyerNameField = ({ control }: { control: any }) => (
  <CustomInput
    name='buyerName'
    label='Buyer Name'
    inputClassName='uppercase'
    placeHolder='Enter Buyer Name'
    required
  />
);

export const BuyerAddressField = ({ control }: { control: any }) => (
  <CustomInput
    name='buyerAddress'
    label='Buyer Address'
    inputClassName='uppercase'
    placeHolder='Enter Buyer Address'
    required
  />
);

export const BuyerPhoneField = ({ control }: { control: any }) => {
  const { field } = useController({
    name: 'buyerPhone',
    control,
    defaultValue: '' // Set a default value if needed
  });

  return (
    <CustomInput
      name='buyerPhone'
      label='Buyer Phone'
      placeHolder='Enter Buyer phone(s), e.g., 9876543210, 9765432109'
      required
      onChange={(e) => {
        // Replace spaces or commas with `/` and remove invalid characters
        const filteredValue = e.target.value
          .replace(/[^0-9,/\s]/g, '') // Allow only numbers, spaces, commas, and slashes
          .replace(/[\s,]+/g, '/'); // Replace spaces or commas with `/`
        field.onChange(filteredValue);
      }}
    />
  );
};

export const BuyerPanField = ({ control }: { control: any }) => {
  const { field } = useController({
    name: 'buyerPan',
    control,
    defaultValue: '' // Set a default value if needed
  });

  return (
    <CustomInput
      name='buyerPan'
      label='Buyer PAN'
      placeHolder='Enter buyer PAN'
      required
      onChange={(e) => {
        // Allow only numeric characters and limit to 9 digits
        const filteredValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
        field.onChange(filteredValue);
      }}
    />
  );
};
