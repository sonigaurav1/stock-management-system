import { Product } from '../../types/product.types';

export default function ProductPricing({ product }: { product: Product }) {
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  // Calculate profit margin if both prices are available
  // const calculateMargin = () => {
  //   if (product.purchasePrice && product.sellingPrice) {
  //     const margin = ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100
  //     return `${margin.toFixed(2)}%`
  //   }
  //   return "N/A"
  // }

  // Calculate discount percentage if both prices are available
  // const calculateDiscount = () => {
  //   if (product.sellingPrice && product.discountPrice) {
  //     const discount = ((product.sellingPrice - product.discountPrice) / product.sellingPrice) * 100
  //     return `${discount.toFixed(2)}%`
  //   }
  //   return "N/A"
  // }

  return (
    <div>
      <h3 className='mb-2 text-lg font-medium'>Pricing</h3>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>
            Purchase Price
          </p>
          <p>NPR {product.purchasePrice}</p>
        </div>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>
            Selling Price
          </p>
          <p className='text-muted-foreground'>
            {formatCurrency(product.sellingPrice)}
          </p>
        </div>
        {/* {product.discountPrice && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Discount Price</p>
              <p className="font-medium">{formatCurrency(product.discountPrice)}</p>
            </div>
          )} */}
        {/* {product.discountPrice && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Discount</p>
              <p>{calculateDiscount()}</p>
            </div>
          )} */}
      </div>
    </div>
  );
}
