/* eslint-disable no-console */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Product } from '../../types/product.types';
import { useEdgeStore } from '@/lib/edgestore';
import { redirect } from 'next/navigation';
import { Id } from 'convex/_generated/dataModel';
import { formSchema } from '../../schema/ProductSchema';
import CustomImageUpload from '../CustomImageUpload';
import { useState } from 'react';
import { generateSKU, generateSlug } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  // Mutation hooks
  const createProduct = useMutation(api.documents.createProduct);
  const updateProduct = useMutation(api.documents.updateProduct);

  // Query hooks
  const category = useQuery(api.documents.getAllCategories) ?? [];
  const suppliers = useQuery(api.documents.getAllSuppliers) ?? [];

  // Local state
  const [progress, setProgress] = useState<number>(0);

  const { edgestore } = useEdgeStore();

  type FormValues = z.infer<typeof formSchema>;
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name ?? 'Apple iPhone 14 Pro',
    barcode: initialData?.barcode ?? '123456789012',
    category: initialData?.category ?? '',
    subcategory: initialData?.subcategory ?? '',
    description:
      initialData?.description ??
      'Apple iPhone 14 Pro with A16 Bionic chip and 256GB storage',
    brand: initialData?.brand ?? 'Apple',
    purchasePrice: initialData?.purchasePrice ?? 950,
    sellingPrice: initialData?.sellingPrice ?? 1099,
    stockLevel: initialData?.stockLevel ?? 50,
    inStock: initialData?.inStock ?? true,
    reorderLevel: initialData?.reorderLevel ?? 10,
    stockStatus:
      (initialData?.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock') ??
      'in_stock',
    supplierId: initialData?.supplierId ?? '',
    lastRestockedAt: initialData?.lastRestockedAt,
    image: null as File | null // Explicitly set the type of image
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialData === null) {
      const file = values?.image;

      let res = null;

      if (file) {
        res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setProgress(progress);
          }
        });
      }

      try {
        const promise = createProduct({
          name: values.name,
          slug: generateSlug(values.name),
          sku: generateSKU(values.category, values.brand, values.name),
          barcode: values.barcode,
          category: values.category,
          subcategory: values.subcategory,
          description: values.description,
          brand: values.brand,
          purchasePrice: values.purchasePrice ?? 0,
          sellingPrice: values.sellingPrice ?? 0,
          discountPrice:
            (values.sellingPrice ?? 0) - (values.purchasePrice ?? 0),
          stockLevel: values.stockLevel ?? 0,
          inStock: values.inStock,
          reorderLevel: values.reorderLevel ?? 0,
          stockStatus: values.stockStatus,
          supplierId: values.supplierId,
          lastRestockedAt: values.lastRestockedAt,
          imageUrl: res?.url ?? undefined
        });

        toast.promise(promise, {
          loading: 'Uploading details...',
          success: 'Details uploaded!',
          error: 'Failed to upload details.'
        });

        redirect('/dashboard/product');
      } catch (error) {
        toast.warning('You have reached the maximum product creation limit.');

        if (res?.url) {
          await edgestore.publicFiles.delete({
            url: res.url
          });
        }
      }
    } else {
      let imageUrl = initialData?.imageUrl;

      if (values.image) {
        const res = await edgestore.publicFiles.upload({
          file: values.image,
          onProgressChange: (progress) => {
            console.log(progress);
          }
        });
        imageUrl = res.url;
      }

      const promise = updateProduct({
        id: initialData?._id as Id<'products'>,
        updates: {
          name: values?.name || initialData?.name,
          barcode: values?.barcode || initialData?.barcode,
          category: values?.category || initialData?.category,
          subcategory: values?.subcategory || initialData?.subcategory,
          description: values?.description || initialData?.description,
          brand: values?.brand || initialData?.brand,
          purchasePrice: values?.purchasePrice || initialData?.purchasePrice,
          sellingPrice: values?.sellingPrice || initialData?.sellingPrice,
          discountPrice:
            (values?.sellingPrice ?? 0) - (values?.purchasePrice ?? 0) ||
            initialData?.sellingPrice - initialData?.purchasePrice,
          stockLevel: values?.stockLevel || initialData?.stockLevel,
          inStock: values?.inStock ?? initialData?.inStock, // || operator is not working here so using ??
          reorderLevel: values?.reorderLevel || initialData?.reorderLevel,
          stockStatus: values?.stockStatus || initialData?.stockStatus,
          supplierId: values?.supplierId || initialData?.supplierId,
          lastRestockedAt:
            values?.lastRestockedAt || initialData?.lastRestockedAt,
          imageUrl: imageUrl ?? undefined
        }
      });

      toast.promise(promise, {
        loading: 'Updating product details...',
        success: 'Updated product details!',
        error: 'Failed to update product details.'
      });

      redirect('/dashboard/product');
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='h-full w-full'>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <CustomImageUpload
                        value={field.value}
                        onChange={(file) => field.onChange(file || null)}
                        maxSizeInMB={4}
                        defaultPreview={initialData?.imageUrl || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name='barcode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Barcode' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {category?.map((cat) => (
                          <SelectItem key={cat._id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name='subcategory'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Subcategory' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name='brand'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter Brand' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='purchasePrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='Enter purchase price'
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? null
                              : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='sellingPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Selling Price'
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? null
                              : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name='discountPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Discount Price'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name='stockLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Level</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Stock Level'
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? null
                              : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='inStock'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In Stock</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
                      value={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Stock Status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='true'>Yes</SelectItem>
                        <SelectItem value='false'>No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='reorderLevel'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Reorder Level'
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? null
                              : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='stockStatus'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Stock Status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='in_stock'>In Stock</SelectItem>
                        <SelectItem value='low_stock'>Low Stock</SelectItem>
                        <SelectItem value='out_of_stock'>
                          Out of Stock
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='supplierId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Supplier Name' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem
                            key={supplier._id}
                            value={generateSlug(supplier.name)}
                          >
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastRestockedAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Restocked At</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type='datetime-local'
                          placeholder='Select Last Restocked Date'
                          className='w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:opacity-0'
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toLocaleString('sv-SE', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  })
                                  .replace(' ', 'T')
                              : ''
                          }
                          onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            const timestamp = selectedDate.getTime();
                            field.onChange(timestamp);
                          }}
                          onClick={(e) => {
                            e.currentTarget.showPicker();
                          }}
                        />
                        <Calendar className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500' />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter product description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {progress > 0 && <p>Uploading: {progress}%</p>}
            {initialData === null ? (
              <Button type='submit'>Add Product</Button>
            ) : (
              <Button type='submit'>Edit Product</Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
