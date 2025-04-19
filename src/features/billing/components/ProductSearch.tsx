import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { Command, CommandList } from '@/components/ui/command';
import { SearchIcon } from 'lucide-react';
import ProductList from './ProductList';
import { useDebouncedSetSearchTerm } from '../utils/handlers';

interface ProductSearchProps {
  searchTerm: string;
  dispatch: any;
  products: any[];
  isFetching: boolean;
  handleProductSelect: any;
}

export const ProductSearch = ({
  searchTerm,
  dispatch,
  products,
  isFetching,
  handleProductSelect
}: ProductSearchProps) => {
  const debouncedSetSearchTerm = useDebouncedSetSearchTerm(dispatch);

  return (
    <div className='mb-6'>
      <Popover>
        <PopoverTrigger asChild>
          <div className='relative w-full'>
            <Input
              value={searchTerm}
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              placeholder='Search for a product'
              className='mb-2 w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            />
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400'>
              <SearchIcon className='h-4 w-4' />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-gray-100 p-0 shadow-lg'
          sideOffset={5}
        >
          <Command className='w-full rounded-lg'>
            <div className='border-b border-gray-100'>
              <div className='relative'>
                <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <Input
                  className='w-full border-none py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400 focus:ring-0'
                  placeholder='Search for a product'
                  value={searchTerm}
                  onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CommandList className='max-h-64 w-full overflow-auto'>
              <ProductList
                products={products.map((product: any) => ({
                  id: product._id,
                  name: product.name,
                  imageUrl: product.imageUrl,
                  rate: product.sellingPrice,
                  ...(product as any)
                }))}
                isFetching={isFetching}
                handleProductSelect={handleProductSelect}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
