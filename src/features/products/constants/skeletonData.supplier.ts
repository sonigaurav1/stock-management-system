import { SkeletonSupplier } from '../types/supplier.types';

export const supplierSkeletonData: SkeletonSupplier[] = Array(5).fill({
  _id: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  imageUrl: '',
  createdAt: '',
  updatedAt: ''
});
