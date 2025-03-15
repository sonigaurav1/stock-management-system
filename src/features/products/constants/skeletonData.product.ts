import { SkeletonProduct } from '../types/product.types';

export const productSkeletonData: SkeletonProduct[] = Array(10).fill({
  _id: '',
  _creationTime: '',
  name: '',
  slug: '',
  sku: '', // Unique product identifier
  barcode: '', // Barcode for scanning
  category: '',
  subcategory: '',
  description: '',
  brand: '',
  purchasePrice: '', // Cost price
  sellingPrice: '', // Selling price
  stockLevel: '', // Current stock quantity
  inStock: '', // In stock status
  reorderLevel: '', // Minimum stock before reorder alert
  stockStatus: '', // "in_stock", "low_stock", "out_of_stock"
  supplierId: '', // Supplier reference
  lastRestockedAt: '', // Timestamp of last restock
  imageUrl: '', // Image URL
  isDeleted: '' // Soft delete flag (false = active, true = deleted)
});
