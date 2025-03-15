'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './CellAction';
import { Product, SkeletonProduct } from '../../../types/product.types';
import { Skeleton } from '@/components/ui/skeleton';
import CustomTooltip from '@/components/ui/custom/CustomTooltip';

const placeholderImageUrl = '/assets/images/product-placeholder.webp';

const stockStatusMapping: { [key: string]: string } = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock'
};

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
    accessorKey: 'serialNumber',
    header: 'SN'
  },
  {
    accessorKey: 'name',
    header: 'Model',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className='max-w-64'>
          <CustomTooltip
            triggerElement={name}
            tooltipContent={name}
            delayDuration={0}
            triggerClassName='max-w-64 truncate'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'categoryName',
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
    header: 'STOCK STATUS',
    cell: ({ row }) => {
      const stockStatus = row.original.stockStatus;
      return stockStatusMapping[stockStatus] || 'Unknown';
    }
  },
  {
    accessorKey: 'supplierName',
    header: 'SUPPLIER'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className='max-w-64'>
          <CustomTooltip
            triggerElement={description}
            tooltipContent={description}
            contentClassName='max-w-96'
            delayDuration={0}
            triggerClassName='max-w-64 truncate'
          />
        </div>
      );
    }
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
