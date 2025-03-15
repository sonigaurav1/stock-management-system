import { CircleAlert, CircleCheck, CircleDashed } from 'lucide-react';
import { Product } from '../../types/product.types';

export default function ProductStockStatus({ product }: { product: Product }) {
  // Determine stock status icon
  const getStockStatusIcon = () => {
    switch (product.stockStatus) {
      case 'in_stock':
        return <CircleCheck className='h-5 w-5 text-green-500' />;
      case 'low_stock':
        return <CircleAlert className='h-5 w-5 text-amber-500' />;
      case 'out_of_stock':
        return <CircleAlert className='h-5 w-5 text-red-500' />;
      default:
        return <CircleDashed className='h-5 w-5 text-muted-foreground' />;
    }
  };

  // Format stock status for display
  const getStockStatusText = () => {
    switch (product.stockStatus) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return (
    <div>
      <h3 className='mb-2 text-lg font-medium'>Stock Information</h3>
      <div className='grid grid-cols-2 gap-4'>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-medium text-muted-foreground'>Status</p>
          <div className='flex items-center gap-1'>
            {getStockStatusIcon()}
            <span>{getStockStatusText()}</span>
          </div>
        </div>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>
            Current Stock
          </p>
          <p>{product.stockLevel !== undefined ? product.stockLevel : 'N/A'}</p>
        </div>
        {product.reorderLevel !== undefined && (
          <div>
            <p className='text-sm font-medium text-muted-foreground'>
              Reorder Level
            </p>
            <p>{product.reorderLevel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
