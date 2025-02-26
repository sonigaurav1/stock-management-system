export interface Category {
  _id: string;
  _creationTime: string | number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isDeleted: boolean;
}

export interface SkeletonCategory {
  _id?: string;
  _creationTime?: string | number;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  isDeleted?: boolean;
}
