/**
 * Product Query Types
 */

export interface GetProductsQuery {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  color?: string;
  size?: string;
  featured?: boolean;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "name" | "basePrice";
  sortOrder?: "asc" | "desc";
}


export interface ProductDto {
  name: string;
  description: string;
  careGuide: string;
  sizeGuide: string;
  basePrice: number;
  categoryId: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured?: boolean;
  featuredImage?: string;
  variants: Array<{
    size: string;
    color: string;
    stock: number;
    price?: number;
  }>;
  media?: Array<{
    url: string;
    publicId: string;
    type: "image" | "video";
    format?: string;
  }>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  careGuide?: string;
  sizeGuide?: string;
  basePrice?: number;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured?: boolean;
  featuredImage?: string;
  variants?: Array<{
    id?: string;
    size?: string;
    color?: string;
    stock?: number;
    price?: number;
  }>;
  media?: Array<{
    url: string;
    publicId: string;
    type: "image" | "video";
    format?: string;
  }>;
}


export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "createdAt" | "name" | "basePrice";
  sortOrder?: "asc" | "desc";
  color?: string;
  size?: string;
}
