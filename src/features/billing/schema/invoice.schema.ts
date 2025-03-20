import { z } from 'zod';

export const formSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  vatNumber: z.string().optional(),
  transactionDate: z.string().optional(),
  invoiceNumber: z.string().nonempty({ message: 'Invoice number is required' }),
  date: z.string().optional(),
  miti: z.string().optional(),
  paymentMode: z.string().nonempty({ message: 'Payment mode is required' }),
  buyerName: z.string().nonempty({ message: 'Buyer name is required' }),
  buyerAddress: z.string().nonempty({ message: 'Buyer address is required' }),
  buyerPhone: z
    .string()
    .refine(
      (value) => {
        if (!value) return true;
        const phoneNumbers = value.split('/');
        return phoneNumbers.every((phone) => /^\d{10}$/.test(phone));
      },
      {
        message:
          'Each phone number must be a valid 10-digit number separated by `/`'
      }
    )
    .refine((value) => value.trim() !== '', {
      message: 'Buyer phone number is required'
    }),
  buyerPan: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const panNumbers = value.split('/');
        return panNumbers.every((pan) => /^\d{9}$/.test(pan));
      },
      {
        message: 'Buyer PAN must be exactly 9 characters long'
      }
    ),
  items: z
    .array(
      z.object({
        sn: z.number(),
        hsCode: z.string(),
        description: z.string(),
        quantity: z.number(),
        unit: z.string(),
        rate: z.number(),
        amount: z.number()
      })
    )
    .optional(),
  isAdmin: z.boolean().optional(),
  value: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
  nonTaxable: z.number().nullable().optional(),
  taxableAmount: z.number().nullable().optional(),
  vatAmount: z.number().nullable().optional(),
  totalAmount: z.number().nullable().optional(),
  amountInWords: z.string().nullable().optional(),
  printDate: z.string().optional(),
  printTime: z.string().optional(),
  vehicleNo: z.string().nullable().optional(),
  remarks: z.string().nullable().optional()
});
