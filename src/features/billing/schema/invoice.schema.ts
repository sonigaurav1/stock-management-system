import { z } from 'zod';

export const formSchema = z.object({
  companyName: z.string(),
  companyAddress: z.string(),
  phone: z.string(),
  email: z.string().email(),
  vatNumber: z.string(),
  transactionDate: z.string(),
  invoiceNumber: z.string(),
  date: z.string(),
  miti: z.string(),
  paymentMode: z.string(),
  buyerName: z.string(),
  buyerAddress: z.string(),
  buyerPhone: z
    .string()
    .optional()
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
    ),
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
    .max(19),
  value: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
  nonTaxable: z.number().nullable().optional(),
  taxableAmount: z.number().nullable().optional(),
  vatAmount: z.number().nullable().optional(),
  totalAmount: z.number().nullable().optional(),
  amountInWords: z.string().nullable().optional(),
  printDate: z.string(),
  printTime: z.string(),
  vehicleNo: z.string().nullable().optional(),
  remarks: z.string().nullable().optional()
});
