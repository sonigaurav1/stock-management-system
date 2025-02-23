import { z } from "zod";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const formSchema = z.object({
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
    ),
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.'
  }),
  category: z.string(),
  price: z
    .union([z.string(), z.number()]) // Accept both string and number
    .transform((val) => {
      // Convert string to number if it's a string
      return typeof val === 'string' ? parseFloat(val) : val;
    })
    .refine((val) => !isNaN(val), { message: 'Price must be a valid number' }),
  quantity: z
    .union([z.string(), z.number()]) // Accept both string and number
    .transform((val) => {
      // Convert string to number if it's a string
      return typeof val === 'string' ? parseFloat(val) : val;
    })
    .refine((val) => !isNaN(val), {
      message: 'Quantity must be a valid number'
    }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  })
});