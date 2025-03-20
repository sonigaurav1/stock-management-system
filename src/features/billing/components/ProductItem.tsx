/* eslint-disable import/no-unresolved */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';

import '@/app/globals.css';

const placeholderImageUrl = '/assets/images/product-placeholder.webp';

const ProductItem = ({
  product,
  index,
  handleQuantityChange,
  handleRateChange,
  handleRemoveProduct
}: any) => {
  return (
    <div className='flex items-center gap-2 rounded border p-2'>
      <Image
        src={product.imageUrl || placeholderImageUrl}
        width={50}
        height={50}
        alt={product.name}
        className='rounded object-cover'
      />
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{product.name}</p>
      </div>
      <div className='flex items-center space-x-1'>
        <Button
          type='button'
          size='icon'
          variant='outline'
          onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
        >
          <Minus className='h-4 w-4' />
        </Button>
        <Input
          type='number'
          value={product.quantity || 0} // Default to 0 if quantity is null or undefined
          onChange={(e) => {
            const newQuantity = Number.parseInt(e.target.value, 10);
            if (!isNaN(newQuantity)) {
              handleQuantityChange(product.id, newQuantity);
            }
          }}
          className='no-spinner w-16 text-center'
          min='1'
          max={product.stockLevel} // Ensure quantity does not exceed stockLevel
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button
          type='button'
          size='icon'
          variant='outline'
          onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>
      <Input
        type='text'
        value={product.rate}
        onChange={(e) =>
          handleRateChange(index, Number.parseFloat(e.target.value) || 0)
        }
        className='w-20'
        min='0'
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => handleRemoveProduct(index)}
        className='text-red-500'
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  );
};

export default ProductItem;
