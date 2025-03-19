/* eslint-disable import/no-unresolved */
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { PAYMENT_METHODS } from '../constants';

export const InvoiceNumberField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name='invoiceNumber'
    render={({ field }) => (
      <FormItem>
        <FormLabel className='flex items-center'>
          Invoice Number
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className='ml-1 size-4' />
            </TooltipTrigger>
            <TooltipContent>
              <p>Enter the unique invoice number</p>
            </TooltipContent>
          </Tooltip>
        </FormLabel>
        <FormControl>
          <Input placeholder='Enter invoice number' {...field} />
        </FormControl>
      </FormItem>
    )}
  />
);

export const PaymentModeField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name='paymentMode'
    render={({ field }) => (
      <FormItem>
        <FormLabel>Payment Mode</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder='Select payment mode' />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const BuyerNameField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name='buyerName'
    render={({ field }) => (
      <FormItem>
        <FormLabel>Buyer Name</FormLabel>
        <FormControl>
          <Input
            className='uppercase'
            placeholder='Enter buyer name'
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const BuyerAddressField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name='buyerAddress'
    render={({ field }) => (
      <FormItem>
        <FormLabel>Buyer Address</FormLabel>
        <FormControl>
          <Input
            className='uppercase'
            placeholder='Enter buyer address'
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const BuyerPhoneField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name='buyerPhone'
    render={({ field }) => (
      <FormItem>
        <FormLabel>Buyer Phone</FormLabel>
        <FormControl>
          <Input
            type='text'
            placeholder='Enter buyer phone(s), e.g., 9876543210, 9765432109'
            value={field.value || ''}
            onChange={(e) => {
              // Replace spaces or commas with `/` and remove invalid characters
              const filteredValue = e.target.value
                .replace(/[^0-9,/\s]/g, '') // Allow only numbers, spaces, commas, and slashes
                .replace(/[\s,]+/g, '/'); // Replace spaces or commas with `/`
              field.onChange(filteredValue);
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const BuyerPanField = ({ control }: { control: any }) => (
  <FormField
    control={control}
    name='buyerPan'
    render={({ field }) => (
      <FormItem>
        <FormLabel>Buyer PAN</FormLabel>
        <FormControl>
          <Input
            type='text'
            placeholder='Enter buyer PAN'
            value={field.value || ''}
            onChange={(e) => {
              // Allow only numeric characters and limit to 9 digits
              const filteredValue = e.target.value
                .replace(/[^0-9]/g, '')
                .slice(0, 9);
              field.onChange(filteredValue);
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
