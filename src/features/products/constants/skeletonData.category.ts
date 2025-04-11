import { SkeletonCategory } from '../types/category.types';

export const categorySkeletonData: SkeletonCategory[] = Array(5).fill({
  _id: '',
  _creationTime: '',
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  isDeleted: ''
});
