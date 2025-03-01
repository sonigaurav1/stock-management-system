import { z } from 'zod';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const formSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  // slug: z.string().nonempty({ message: 'Slug is required' }),
  // sku: z.string().nonempty({ message: 'SKU is required' }),
  barcode: z.string().optional(),
  categoryId: z.string().nonempty({ message: 'Category is required' }),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  brand: z.string(),
  purchasePrice: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? null : Number(val)))
    .nullable(),
  sellingPrice: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? null : Number(val)))
    .nullable(),
  stockLevel: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? null : Number(val)))
    .nullable(),
  inStock: z.boolean(),
  reorderLevel: z
    .union([z.string(), z.number()])
    .transform((val) => (val === '' ? null : Number(val)))
    .nullable(),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']),
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
