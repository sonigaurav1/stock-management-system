'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { Product, SkeletonProduct } from '../../../types/product.types';
import { Skeleton } from '@/components/ui/skeleton';

const placeholderImageUrl = '/assets/images/product-placeholder.png';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const imageUrl = row.getValue('imageUrl') as string | undefined;
      return (
        <div className='relative aspect-square max-h-16'>
          <Image
            src={imageUrl || placeholderImageUrl}
            alt={row.getValue('name')}
            fill
            sizes='100%'
            className='rounded-lg'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'category',
    header: 'CATEGORY'
  },
  {
    accessorKey: 'brand',
    header: 'BRAND'
  },
  {
    accessorKey: 'sellingPrice',
    header: 'SELLING PRICE'
  },
  {
    accessorKey: 'stockLevel',
    header: 'STOCK LEVEL'
  },
  {
    accessorKey: 'stockStatus',
    header: 'STOCK STATUS'
  },
  {
    accessorKey: 'supplierId',
    header: 'SUPPLIER'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION'
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

export const skeletonColumns: ColumnDef<SkeletonProduct>[] = [
  {
    id: 'imageUrl',
    header: 'IMAGE',
    accessorFn: () => null,
    cell: () => <Skeleton className='h-10 w-10 rounded-full' />
  },
  {
    accessorKey: 'name',
    header: 'NAME',
    cell: () => <Skeleton className='h-5 w-24' />
  },
  {
    accessorKey: 'category',
    header: 'CATEGORY',
    cell: () => <Skeleton className='h-5 w-20' />
  },
  {
    accessorKey: 'brand',
    header: 'BRAND',
    cell: () => <Skeleton className='h-5 w-20' />
  },
  {
    accessorKey: 'sellingPrice',
    header: 'SELLING PRICE',
    cell: () => <Skeleton className='h-5 w-16' />
  },
  {
    accessorKey: 'stockLevel',
    header: 'STOCK LEVEL',
    cell: () => <Skeleton className='h-5 w-20' />
  },
  {
    accessorKey: 'stockStatus',
    header: 'STOCK STATUS',
    cell: () => <Skeleton className='h-5 w-20' />
  },
  {
    accessorKey: 'supplierId',
    header: 'SUPPLIER',
    cell: () => <Skeleton className='h-5 w-20' />
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION',
    cell: () => <Skeleton className='h-5 w-36' />
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: () => <Skeleton className='h-4 w-8' />
  }
];
