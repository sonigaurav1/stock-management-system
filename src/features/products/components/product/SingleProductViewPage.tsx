/* eslint-disable import/no-unresolved */
'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import ProductPricing from './ProductPricing';
import ProductStockStatus from './ProductStockStatus';
import { Product } from '../../types/product.types';
import { formatDateFromTimestamp } from '@/lib/utils';

export default function SingleProductViewPage({
  productId
}: {
  productId: string;
}) {
  const product = useQuery(
    api.products.getProductById,
    productId ? { id: productId as Id<'products'> } : 'skip'
  ) ?? {
    name: 'N/A',
    sku: 'N/A',
    slug: 'N/A',
    categoryName: 'N/A',
    subcategory: 'N/A',
    serialNumber: 'N/A',
    barcode: 'N/A',
    brand: 'N/A',
    description: 'N/A',
    supplierName: 'N/A',
    supplierId: 'N/A',
    lastRestockedAt: 'N/A',
    createdAt: 'N/A',
    updatedAt: 'N/A',
    inStock: false,
    imageUrl: '',
    sellingPrice: 'N/A',
    discount: 'N?A'
  };

  return (
    <div className='space-y-6 md:container md:mx-auto md:py-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>{product.name}</h1>
        <Badge variant={product.inStock ? 'default' : 'destructive'}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Product Image */}
        <Card className='md:col-span-1'>
          <CardContent className='p-6'>
            {product.imageUrl ? (
              <Image
                src={product.imageUrl || '/placeholder.svg'}
                alt={product.name}
                width={400}
                height={400}
                className='h-auto w-full rounded-md object-cover'
              />
            ) : (
              <div className='flex aspect-square w-full items-center justify-center rounded-md bg-muted'>
                <p className='text-muted-foreground'>No image available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Category: {product.categoryName}
              {product.subcategory && ` > ${product.subcategory}`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Basic Info */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>SKU</p>
                <p>{product.sku}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Slug
                </p>
                <p>{product.slug}</p>
              </div>
              {product.serialNumber && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Serial Number
                  </p>
                  <p>{product.serialNumber}</p>
                </div>
              )}
              {product.barcode && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Barcode
                  </p>
                  <p>{product.barcode}</p>
                </div>
              )}
              {product.brand && (
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Brand
                  </p>
                  <p>{product.brand}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <ProductPricing product={product as Product} />

            <Separator />

            {/* Stock Information */}
            <ProductStockStatus product={product as Product} />

            <Separator />

            {/* Supplier Information */}
            <div>
              <h3 className='mb-2 text-lg font-medium'>Supplier Information</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Supplier Name
                  </p>
                  <p>{product.supplierName || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Supplier ID
                  </p>
                  <p>{product.supplierId || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Last Restocked
                  </p>
                  <p>
                    {formatDateFromTimestamp(Number(product.lastRestockedAt))}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div>
                <h3 className='mb-2 text-lg font-medium'>Description</h3>
                <p className='text-muted-foreground'>{product.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className='grid grid-cols-2 gap-4 text-sm text-muted-foreground'>
              <div>
                <p>
                  Created At:{' '}
                  {formatDateFromTimestamp(Number(product.createdAt))}
                </p>
              </div>
              <div>
                <p>
                  Last Updated:{' '}
                  {formatDateFromTimestamp(Number(product.updatedAt))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
