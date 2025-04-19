import ProductItem from './ProductItem';

interface SelectedProductsListProps {
  products: any[];
  handleQuantityChange: (productId: any, newQuantity: any) => void;
  handleRateChange: (productId: any, newRate: any) => void;
  handleRemoveProduct: (productId: any) => void;
}

const SelectedProductsList = ({
  products,
  handleQuantityChange,
  handleRateChange,
  handleRemoveProduct
}: SelectedProductsListProps) => {
  return (
    <div className='mb-6 space-y-4'>
      {products.length === 0 ? (
        <p className='text-sm text-gray-500'>No products selected</p>
      ) : (
        products.map((product, index) => (
          <ProductItem
            key={`${product.id}-${index}`}
            product={product}
            index={index}
            handleQuantityChange={(productId: any, newQuantity: any) =>
              handleQuantityChange(productId, newQuantity)
            }
            handleRateChange={handleRateChange}
            handleRemoveProduct={handleRemoveProduct}
            className='flex flex-col sm:flex-row'
          />
        ))
      )}
    </div>
  );
};

export default SelectedProductsList;
