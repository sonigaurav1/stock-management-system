export interface Product {
    _id: string;
    _creationTime: string | number;
    imageUrl?: string | undefined;
    inStock?: boolean | undefined;
    name: string;
    category: string;
    price: number;
    quantity?: number;
    description: string;
};