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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Product } from '../../types/product.types';
import { useEdgeStore } from '@/lib/edgestore';
import { useRouter } from 'next/navigation';
import { Id } from 'convex/_generated/dataModel';
import { formSchema } from '../../schema/product-schema';
import CustomImageUpload from '../CustomImageUpload';
import { useEffect, useState } from 'react';
import {
  determineStockStatus,
  generateSKU,
  generateSlug,
  cn
} from '@/lib/utils';
import { Calendar, Plus, Info } from 'lucide-react';
import { restrictedUser } from '../../constants/restrictedUserData';
import { useUser } from '@clerk/nextjs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { maxSizeInMB } from '../../constants';
import useCompressUploadedImage from '../../hooks/useCompressUploadedImage';
import CustomInput from '@/components/form/CustomInput';
import CustomSelect from '@/components/form/CustomSelect';
import CategoryFormDialog from '../category/CategoryFormDialog';
import SupplierFormDialog from '../suppliers/SupplierFormDialog';
import CustomTooltip from '@/components/ui/custom/CustomTooltip';

export default function ProductForm({
  initialData,
  pageTitle,
  onSuccess
}: {
  initialData: Product | null;
  pageTitle: string;
  onSuccess?: () => void;
}) {
  const { user } = useUser();
  const router = useRouter();
  const { compressedFile, compressImage } = useCompressUploadedImage();

  // Mutation hooks
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);

  // Query hooks
  const categories = useQuery(api.categories.getAllCategories) ?? [];
  const suppliers = useQuery(api.suppliers.getAllSuppliers) ?? [];

  // fetch all categories to check if the user has reached the limit
  const allProducts = useQuery(
    api.products.getAllProducts,
    user?.id === restrictedUser.id ? undefined : 'skip'
  );

  // Local state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [categoryRefresh, setCategoryRefresh] = useState<number>(0);
  const [supplierRefresh, setSupplierRefresh] = useState<number>(0);

  const { edgestore } = useEdgeStore();

  type FormValues = z.infer<typeof formSchema>;
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name ?? '',
    barcode: initialData?.barcode ?? '',
    categoryId: initialData?.categoryId ?? '',
    subcategory: initialData?.subcategory ?? '',
    description: initialData?.description ?? '',
    serialNumber: initialData?.serialNumber ?? '',
    brand: initialData?.brand ?? '',
    purchasePrice: initialData?.purchasePrice ?? '',
    sellingPrice:
      initialData?.sellingPrice !== undefined
        ? Number(initialData.sellingPrice)
        : undefined,
    stockLevel:
      initialData?.stockLevel !== undefined
        ? Number(initialData.stockLevel)
        : undefined,
    // inStock: initialData?.inStock ?? true,
    reorderLevel:
      initialData?.reorderLevel !== undefined
        ? Number(initialData.reorderLevel)
        : undefined,
    // stockStatus:
    //   (initialData?.stockStatus as 'in_stock' | 'low_stock' | 'out_of_stock') ??
    //   'in_stock',
    supplierId: initialData?.supplierId ?? '',
    lastRestockedAt: initialData?.lastRestockedAt ?? Date.now(),
    image: null as File | null // Explicitly set the type of image
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (imageFile) {
      compressImage(imageFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  async function uploadFile(file: File | null) {
    if (!file) return null;

    return await edgestore.publicFiles.upload({
      file,
      onProgressChange: (progress) => {
        setProgress(progress);
      }
    });
  }

  const handleFileChange = (file: File) => {
    setImageFile(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (initialData === null && allProducts?.length === restrictedUser.limit) {
      toast.warning('Limitation Error', {
        description: `You have reached the limit of ${restrictedUser.limit} active products.`,
        duration: 5000
      });
      setIsLoading(false);
      return;
    }

    let imageUrl = initialData?.imageUrl;

    if (compressedFile) {
      const res = await uploadFile(compressedFile as File);
      imageUrl = res?.url ?? initialData?.imageUrl ?? '';
    }

    const productData = {
      name: values.name,
      slug: generateSlug(values.name),
      sku: generateSKU(
        categories.find((cat) => cat._id === values.categoryId)?.name ?? '',
        values.name,
        values.brand
      ),
      barcode: values.barcode,
      categoryId: values.categoryId,
      categoryName:
        categories.find((cat) => cat._id === values.categoryId)?.name ?? '',
      subcategory: values.subcategory,
      description: values.description,
      serialNumber: values.serialNumber,
      brand: values.brand,
      purchasePrice: values.purchasePrice,
      sellingPrice: values.sellingPrice,
      stockLevel: values.stockLevel,
      reorderLevel: values.reorderLevel,
      stockStatus: determineStockStatus({
        stockLevel: values.stockLevel,
        reorderLevel: values.reorderLevel
      }),
      inStock: (values.stockLevel ?? 0) > 0,
      supplierId: values.supplierId,
      supplierName:
        suppliers.find((supplier) => supplier._id === values.supplierId)
          ?.name ?? '',
      lastRestockedAt: values.lastRestockedAt,
      imageUrl,
      // STEP 5.1: HSN/SAC Code
      hsnsacCode: values.hsnsacCode
    };

    const promise =
      initialData === null
        ? createProduct(productData)
        : updateProduct({
            id: initialData._id as Id<'products'>,
            updates: productData
          });

    toast.promise(promise, {
      loading:
        initialData === null
          ? 'Uploading details...'
          : 'Updating product details...',
      success:
        initialData === null
          ? 'Product created successfully!'
          : 'Updated product details!',
      error:
        initialData === null
          ? 'Failed to upload details.'
          : 'Failed to update product details.'
    });

    await promise.then(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/inventory/products');
      }
    });

    setProgress(0);
    setIsLoading(false);
  }

  const cardClassName = cn('w-full', !onSuccess && 'mx-auto mb-16');

  return (
    <Card className={cardClassName}>
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
                    <div className='flex items-center gap-2'>
                      <FormLabel>Images</FormLabel>
                      <CustomTooltip
                        tooltipContent='Upload product images to help customers identify products visually. First image will be the main product image.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
                    <FormControl>
                      <CustomImageUpload
                        value={field.value}
                        onChange={(file) => {
                          handleFileChange(file as any);
                        }}
                        maxSizeInMB={maxSizeInMB}
                        defaultPreview={initialData?.imageUrl || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <CustomInput
                name='name'
                label='Product Model'
                placeHolder='Enter Product Model'
                required
                tooltipContent='The product name or model number as it appears on the product. This is used for searching and listing products.'
              />
              <CustomInput
                name='brand'
                label='Product Brand'
                placeHolder='Enter Product Brand'
                tooltipContent='The manufacturer or brand name of the product (e.g., Apple, Samsung, Sony). Helps in filtering and categorizing products.'
              />
              {/* STEP 5.1: HSN/SAC Code */}
              <CustomInput
                name='hsnsacCode'
                label='HSN/SAC Code'
                placeHolder='e.g., 8471 for Computers'
                tooltipContent='HSN (Harmonized System of Nomenclature) code for goods, SAC code for services. Required for GST invoices and tax compliance. Search codes at: cleartax.gov.in/hsn-code-search'
              />
              <CustomSelect
                name='categoryId'
                placeholder='Select Product Category'
                options={categories.map((category) => ({
                  value: category._id,
                  label: category.name
                }))}
                required
                label='Category'
                valueKey='_id'
                labelKey='name'
                tooltipContent='Product category for organizing inventory. Categories help in filtering products and generating category-wise reports.'
                trailingComponent={
                  <CategoryFormDialog
                    triggerIcon={true}
                    onCategoryAdded={() => {
                      setCategoryRefresh(categoryRefresh + 1);
                    }}
                  />
                }
              />
              <CustomSelect
                name='supplierId'
                placeholder='Select Supplier Name'
                options={suppliers.map((supplier) => ({
                  value: supplier._id,
                  label: supplier.name
                }))}
                label='Supplier'
                valueKey='_id'
                labelKey='name'
                tooltipContent='Primary supplier for this product. Used for purchase orders and tracking supplier performance.'
                trailingComponent={
                  <SupplierFormDialog
                    triggerIcon={true}
                    onSupplierAdded={() => {
                      setSupplierRefresh(supplierRefresh + 1);
                    }}
                  />
                }
              />
              {/* <FormField
                control={form.control}
                name='supplierId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(field.value === value ? '' : value)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select Supplier Name' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name='serialNumber'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Serial Number</FormLabel>
                      <CustomTooltip
                        tooltipContent='Unique serial number for tracking individual items. Useful for warranty tracking and warranty claims.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter Serial Number'
                        {...field}
                        className='no-spinner'
                        min={0}
                      />
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
                    <div className='flex items-center gap-2'>
                      <FormLabel>Purchase Price</FormLabel>
                      <CustomTooltip
                        tooltipContent='Cost price per unit - what you pay to the supplier. Used for profit margin calculation.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter Purchase Price'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? '' : e.target.value
                          )
                        }
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
                    <div className='flex items-center gap-2'>
                      <FormLabel>Selling Price</FormLabel>
                      <CustomTooltip
                        tooltipContent='Selling price per unit - what customers pay. Your profit = Selling Price - Purchase Price.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Selling Price'
                        className='no-spinner'
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='stockLevel'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Stock Level</FormLabel>
                      <CustomTooltip
                        tooltipContent='Current quantity in stock. When this reaches reorder level, you will be alerted to restock.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Stock Level'
                        className='no-spinner'
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
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
              /> */}
              <FormField
                control={form.control}
                name='reorderLevel'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Reorder Level</FormLabel>
                      <CustomTooltip
                        tooltipContent='Minimum stock quantity before you get an alert. Recommended: 10-20% of maximum stock level.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter Reorder Level'
                        className='no-spinner'
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* STEP 4.2: Auto-Reorder Switch */}
              <FormField
                control={form.control}
                name='autoReorderEnabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='flex items-center gap-2 space-y-0.5'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <FormLabel className='text-base'>
                            Auto-Reorder
                          </FormLabel>
                          <CustomTooltip
                            tooltipContent='When enabled, a purchase order will be automatically created when stock falls below reorder level.'
                            side='right'
                          >
                            <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                          </CustomTooltip>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          Automatically create purchase order when stock falls
                          below reorder level
                        </p>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* <FormField
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
              /> */}
              <FormField
                control={form.control}
                name='lastRestockedAt'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Last Restocked At</FormLabel>
                      <CustomTooltip
                        tooltipContent='Date when the product was last restocked. Helps track inventory turnover and restock frequency.'
                        side='right'
                      >
                        <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                      </CustomTooltip>
                    </div>
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
                  <div className='flex items-center gap-2'>
                    <FormLabel>Description</FormLabel>
                    <CustomTooltip
                      tooltipContent='Product description for customer reference and sales quotes. Include key features and specifications.'
                      side='right'
                    >
                      <Info className='h-4 w-4 cursor-help text-muted-foreground' />
                    </CustomTooltip>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder='Enter Product Description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {progress > 0 && (
              <div className='flex items-center gap-4'>
                <Progress value={progress} />
                <span className='text-xs font-semibold text-muted-foreground'>
                  {progress}%
                </span>
              </div>
            )}
            {initialData === null ? (
              <Button disabled={isLoading} type='submit'>
                Add Product
              </Button>
            ) : (
              <Button disabled={isLoading} type='submit'>
                Edit Product
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
