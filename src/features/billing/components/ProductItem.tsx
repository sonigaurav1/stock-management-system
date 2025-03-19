/* eslint-disable import/no-unresolved */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

const placeholderImageUrl = '/assets/images/product-placeholder.webp';

const ProductItem = ({
  product,
  index,
  handleQuantityChange,
  handleRateChange,
  handleRemoveProduct
}: any) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const enableInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

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
          onClick={() => handleQuantityChange(index, product.quantity - 1)}
        >
          <Minus className='h-4 w-4' />
        </Button>
        <Input
          type='text'
          value={product.quantity}
          onChange={(e) =>
            handleQuantityChange(index, Number.parseInt(e.target.value) || 0)
          }
          className='w-16 text-center'
          min='1'
        />
        <Button
          type='button'
          size='icon'
          variant='outline'
          onClick={() => handleQuantityChange(index, product.quantity + 1)}
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
        ref={inputRef}
        onFocus={enableInput}
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
