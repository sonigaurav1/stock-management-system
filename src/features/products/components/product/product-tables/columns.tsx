'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './CellAction';
import { Product, SkeletonProduct } from '../../../types/product.types';
import { Skeleton } from '@/components/ui/skeleton';
import CustomTooltip from '@/components/ui/custom/CustomTooltip';
import { truncate } from '@/lib/utils';
import ImagePreview from '../../common/ImagePreview';

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
        <ImagePreview
          src={imageUrl}
          alt={row.getValue('name') as string}
          fallbackSrc={placeholderImageUrl}
        />
      );
    }
  },
  {
    accessorKey: 'serialNumber',
    header: 'SN',
    cell: ({ row }) => {
      const serialNumber = row.getValue('serialNumber') as string;
      return (
        <div className='max-w-64'>
          <CustomTooltip
            triggerElement={truncate(serialNumber, { maxLength: 10 })}
            tooltipContent={serialNumber}
            delayDuration={0}
            triggerClassName='max-w-64 truncate'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'Model',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className='max-w-64'>
          <CustomTooltip
            triggerElement={truncate(name, { maxLength: 20 })}
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
  // STEP 2.2: Margin Column
  {
    accessorKey: 'marginPercent',
    header: 'MARGIN',
    cell: ({ row }) => {
      const marginPercent = row.original.marginPercent || 0;
      let colorClass = 'text-muted-foreground';
      if (marginPercent >= 30) colorClass = 'text-green-600';
      else if (marginPercent >= 15) colorClass = 'text-green-500';
      else if (marginPercent >= 5) colorClass = 'text-yellow-600';
      else if (marginPercent >= 0) colorClass = 'text-orange-600';
      else colorClass = 'text-red-600';

      return (
        <span className={`font-semibold ${colorClass}`}>
          {marginPercent.toFixed(1)}%
        </span>
      );
    }
  },
  // STEP 2.3: Days in Stock Column
  {
    accessorKey: 'daysInStock',
    header: 'DAYS',
    cell: ({ row }) => {
      const daysInStock = row.original.daysInStock || 0;
      let colorClass = 'text-muted-foreground';
      if (daysInStock <= 30) colorClass = 'text-green-600';
      else if (daysInStock <= 60) colorClass = 'text-yellow-600';
      else if (daysInStock <= 90) colorClass = 'text-orange-600';
      else colorClass = 'text-red-600';

      return <span className={colorClass}>{daysInStock} days</span>;
    }
  },
  {
    accessorKey: 'supplierName',
    header: 'SUPPLIER',
    cell: ({ row }) => {
      const supplierName = row.getValue('supplierName') as string;
      return (
        <div className='max-w-48 md:max-w-40'>
          <CustomTooltip
            triggerElement={supplierName}
            tooltipContent={supplierName}
            delayDuration={0}
            contentClassName=''
            triggerClassName='md:max-w-40 max-w-48 truncate'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className='max-w-48 md:max-w-40'>
          <CustomTooltip
            triggerElement={description}
            tooltipContent={description}
            delayDuration={0}
            triggerClassName='md:max-w-40 max-w-48 truncate'
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
    accessorKey: 'serialNumber',
    header: 'SN',
    cell: () => <Skeleton className='h-5 w-5' />
  },
  {
    accessorKey: 'name',
    header: 'MODEL',
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
  // {
  //   accessorKey: 'description',
  //   header: 'DESCRIPTION',
  //   cell: () => <Skeleton className='h-5 w-36' />
  // },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: () => <Skeleton className='h-4 w-8' />
  }
];
