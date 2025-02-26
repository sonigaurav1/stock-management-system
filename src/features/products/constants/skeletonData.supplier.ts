import { SkeletonSupplier } from '../types/supplier.types';

export const supplierSkeletonData: SkeletonSupplier[] = Array(10).fill({
  _id: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  imageUrl: '',
  createdAt: '',
  updatedAt: ''
});
