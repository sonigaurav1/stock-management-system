import { z } from 'zod';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const formSchema = z.object({
  name: z.string().nonempty({ message: 'Product model is required' }),
  barcode: z.string().optional(),
  // STEP 5.1: HSN/SAC Code for GST
  hsnsacCode: z.string().optional(),
  categoryId: z.string().nonempty({ message: 'Product category is required' }),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  brand: z.string(),
  purchasePrice: z.string().optional(),
  sellingPrice: z
    .preprocess(
      (value) => {
        if (typeof value === 'string' && value.trim() === '') return undefined;
        const numberValue = Number(value);
        return isNaN(numberValue) ? undefined : numberValue;
      },
      z.number().min(1, 'Selling price must be greater than 0')
    )
    .optional(),
  stockLevel: z
    .preprocess(
      (value) => {
        if (typeof value === 'string' && value.trim() === '') return undefined;
        const numberValue = Number(value);
        return isNaN(numberValue) ? undefined : numberValue;
      },
      z.number().min(0, 'Stock Level must be greater than or equal to 0')
    )
    .optional(),
  // inStock: z.boolean(),
  reorderLevel: z
    .preprocess(
      (value) => {
        if (typeof value === 'string' && value.trim() === '') return undefined;
        const numberValue = Number(value);
        return isNaN(numberValue) ? undefined : numberValue;
      },
      z.number().min(1, 'Reorder Level must be greater than 0')
    )
    .optional(),
  // STEP 4.2: Auto-reorder enabled
  autoReorderEnabled: z.boolean().optional(),
  // stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']),
  supplierId: z.string().optional(),
  lastRestockedAt: z.number().optional(),
  image: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      '.jpg, .jpeg, .png, and .webp files are accepted.'
    )
});
