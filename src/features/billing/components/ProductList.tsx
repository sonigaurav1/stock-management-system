/* eslint-disable import/no-unresolved */
import React from 'react';
import { Spinner } from '@/components/Spinner';
import { PackageIcon, PackageXIcon } from 'lucide-react';
import { Product } from '../interfaces/IBilling';
import { CommandItem } from '@/components/ui/command';
import Image from 'next/image';

const ProductList = ({
  products,
  isFetching,
  handleProductSelect
}: {
  products: Product[];
  isFetching: boolean;
  handleProductSelect: (product: any) => void;
}) => (
  <div className='w-full p-1'>
    {isFetching ? (
      <div className='flex items-center justify-center p-6'>
        <Spinner size='lg' />
      </div>
    ) : products.length === 0 ? (
      <div className='p-4 text-center text-gray-500'>
        <PackageXIcon className='mx-auto mb-2 h-10 w-10 opacity-50' />
        <p>No products found</p>
      </div>
    ) : (
      <div className='w-full p-1'>
        {products.map((product) => (
          <CommandItem
            key={product.id}
            disabled={product.stockLevel < 1}
            onSelect={() => {
              const productHandler = handleProductSelect;
              productHandler({
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl || '',
                quantity: 1,
                rate: (product as any).sellingPrice || 0,
                stockLevel: product.stockLevel
              });
            }}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-blue-50 ${
              product.stockLevel < 1 ? 'cursor-not-allowed' : ''
            }`}
          >
            {product.imageUrl ? (
              <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100'>
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className='h-full w-full object-cover'
                  width={50}
                  height={50}
                />
              </div>
            ) : (
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gray-100'>
                <PackageIcon className='h-5 w-5 text-gray-400' />
              </div>
            )}
            <div className='flex flex-1 flex-col'>
              <span className='font-medium text-gray-800'>{product.name}</span>
              {(product as any).sellingPrice && (
                <span className='text-sm text-gray-500'>
                  NPR {(product as any).sellingPrice.toFixed(2)}
                </span>
              )}
            </div>
          </CommandItem>
        ))}
      </div>
    )}
  </div>
);

export default ProductList;
