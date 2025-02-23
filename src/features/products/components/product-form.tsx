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
import { api } from 'convex/_generated/api';
import { useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Product } from '../types/product.types';
import { useEdgeStore } from '@/lib/edgestore';
import { redirect } from 'next/navigation';
import { Id } from 'convex/_generated/dataModel';
import { formSchema } from '../product-form/ProductSchema';
import CustomImageUpload from '../product-form/CustomImageUpload';
import { useState } from 'react';

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const createProduct = useMutation(api.documents.createProduct);
  const updateProduct = useMutation(api.documents.updateProduct);

  const [progress, setProgress] = useState<number>(0);

  const { edgestore } = useEdgeStore();

  const defaultValues = {
    name: initialData?.name || 'Bulb',
    category: initialData?.category || 'Bulb',
    price: initialData?.price || 120, // Default to 0 if price is not available
    quantity: initialData?.quantity || 60, // Default to 0 if quantity is not available
    description: initialData?.description || 'Best bulb of the year',
    image: null as File | null // Explicitly set the type of image
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialData === null) {
      if (!values.image) {
        toast.error('Image is required for creating a new product.');
        return;
      }

      const file = values.image;
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setProgress(progress);
        }
      });

      const promise = createProduct({
        name: values.name,
        category: values.category,
        price: values.price,
        description: values.description,
        quantity: values.quantity,
        imageUrl: res.url
      });

      toast.promise(promise, {
        loading: 'Uploading details...',
        success: 'Details uploaded!',
        error: 'Failed to upload details.'
      });

      redirect('/dashboard/product');
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
          category: values?.category || initialData?.category,
          price: values?.price || initialData?.price,
          description: values?.description || initialData?.description,
          quantity: values?.quantity || initialData?.quantity,
          imageUrl: imageUrl
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
                        defaultPreview={initialData?.imageUrl}
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
                          <SelectValue placeholder='Select categories' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Fridge'>Fridge</SelectItem>
                        <SelectItem value='Bulb'>Bulb</SelectItem>
                        <SelectItem value='TV'>TV</SelectItem>
                        <SelectItem value='Washing Machine'>
                          Washing Machine
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter price'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter quantity'
                        {...field}
                      />
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
