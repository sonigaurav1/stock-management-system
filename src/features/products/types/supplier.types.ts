export interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface SkeletonSupplier {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  imageUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}
