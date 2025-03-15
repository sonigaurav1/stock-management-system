export interface Product {
  _id: string;
  _creationTime: string | number;
  name: string;
  slug: string;
  sku: string; // Unique product identifier
  barcode?: string; // Barcode for scanning
  categoryId: string;
  subcategory?: string;
  description?: string;
  serialNumber?: string;
  brand?: string;
  purchasePrice: number; // Cost price
  sellingPrice: number; // Selling price
  stockLevel: number; // Current stock quantity
  inStock: boolean; // In stock status
  reorderLevel?: number; // Minimum stock before reorder alert
  stockStatus: string; // "in_stock", "low_stock", "out_of_stock"
  supplierId?: string; // Supplier reference
  lastRestockedAt?: number; // Timestamp of last restock
  imageUrl?: string; // Image URL
  isDeleted: boolean; // Soft delete flag (false = active, true = deleted)
}

export interface SkeletonProduct {
  _id?: string;
  _creationTime?: string | number;
  name?: string;
  slug?: string;
  sku?: string; // Unique product identifier
  barcode?: string; // Barcode for scanning
  category?: string;
  subcategory?: string;
  description?: string;
  serialNumber?: string;
  brand?: string;
  purchasePrice?: number; // Cost price
  sellingPrice?: number; // Selling price
  stockLevel?: number; // Current stock quantity
  inStock?: boolean; // In stock status
  reorderLevel?: number; // Minimum stock before reorder alert
  stockStatus?: string; // "in_stock", "low_stock", "out_of_stock"
  supplierId?: string; // Supplier reference
  lastRestockedAt?: number; // Timestamp of last restock
  imageUrl?: string; // Image URL
  isDeleted?: boolean; // Soft delete flag (false = active, true = deleted)
}
