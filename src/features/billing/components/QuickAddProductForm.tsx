/* eslint-disable import/no-unresolved */
'use client';

import type React from 'react';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn, generateSKU, generateSlug } from '@/lib/utils';
import CustomSelect from '@/components/form/CustomSelect';
import { FormProvider, useController, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CustomInput from '@/components/form/CustomInput';
import CustomCheckbox from '@/components/form/CustomCheckbox';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { toast } from 'sonner';

interface QuickProductFormProps {
  categories: { _id: string; name: string }[];
  onAddProduct: (product: any) => void;
  className?: string;
}

export function QuickProductForm({
  categories,
  onAddProduct,
  className
}: QuickProductFormProps) {
  const [open, setOpen] = useState(false);

  const createProduct = useMutation(api.products.createProduct);

  const formSchema = z
    .object({
      name: z.string().nonempty('Product name is required'),
      price: z
        .string()
        .nonempty('Price is required')
        .refine((value) => !isNaN(Number(value)), {
          message: 'Price must be a number'
        }),
      categoryId: z.string().nonempty('Category is required'),
      addToInventory: z.boolean(),
      stockLevel: z.string().optional()
    })
    .superRefine((data, ctx) => {
      // Make stockLevel required only when addToInventory is true
      if (data.addToInventory) {
        if (!data.stockLevel || data.stockLevel === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stock level is required when adding to inventory',
            path: ['stockLevel']
          });
        } else if (
          isNaN(Number(data.stockLevel)) ||
          Number(data.stockLevel) <= 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stock level must be a positive number',
            path: ['stockLevel']
          });
        }
      }
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: '',
      categoryId: '',
      addToInventory: false,
      stockLevel: ''
    }
  });

  const onSubmit = (values: FormValues) => {
    if (form.getValues('addToInventory')) {
      createProduct({
        name: values.name,
        slug: generateSlug(values.name),
        sku: generateSKU(
          categories.find((cat) => cat._id === values.categoryId)?.name ?? '',
          values.name
        ),
        categoryId: values.categoryId,
        categoryName:
          categories.find((cat) => cat._id === values.categoryId)?.name ?? '',
        sellingPrice: Number.parseFloat(values.price),
        lastRestockedAt: new Date().getTime(),
        stockLevel: Number.parseFloat(values.stockLevel ?? '0'),
        stockStatus: 'in_stock',
        inStock: true
      })
        .then((productId) => {
          if (productId) {
            onAddProduct({
              id: productId,
              name: values.name,
              sellingPrice: Number.parseFloat(values.price),
              stockLevel: Number.parseFloat(values.stockLevel ?? '0')
            });
            toast.success(
              'The product has been successfully added to inventory'
            );
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          toast.error(
            `Failed to add product: ${err.message || 'Unknown error'}`
          );
        });
    } else {
      // Generate a temporary unique ID for non-inventory products
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      toast.success('Product added successfully');
      onAddProduct({
        id: tempId, // Use a unique temporary ID instead of null
        name: values.name,
        sellingPrice: Number.parseFloat(values.price),
        stockLevel: Infinity
      });
    }

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('gap-1 py-4 text-base font-medium', className)}
        >
          <Plus className='h-4 w-4' /> Quick Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Product for Billing</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
            <CustomInput
              name='name'
              label='Product Name'
              placeHolder='Enter product name'
              required
            />
            <CustomInput
              name='price'
              label='Price'
              placeHolder='Enter price'
              required
            />
            <CustomSelect
              name='categoryId'
              placeholder='Select Category Name'
              options={categories.map((category) => ({
                value: category._id,
                label: category.name
              }))}
              label='Category'
              valueKey='_id'
              labelKey='name'
              required
            />
            {form.watch('addToInventory') && (
              <CustomInput
                name='stockLevel'
                label='Stock Level'
                placeHolder='Enter stock level'
                required={form.watch('addToInventory')}
              />
            )}
            <AddToInventoryField control={form.control} />
            <div className='mt-2 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit'>Add Product</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export const AddToInventoryField = ({ control }: { control: any }) => {
  const { field } = useController({
    name: 'addToInventory',
    control,
    defaultValue: false // Default value for the checkbox
  });

  return (
    <CustomCheckbox
      name='addToInventory'
      label=' Add to product inventory'
      onCheckedChange={(checked) => field.onChange(checked)}
    />
  );
};
