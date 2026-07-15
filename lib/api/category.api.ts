/**
 * lib/api/category.api.ts
 *
 * Category-domain API functions, mirroring products.api.ts. Plain async
 * functions — TanStack Query calls them; components never import axios or
 * the client directly.
 */

import { ProductService } from "@/services/product.service";
import type { CategoryDto } from "@/types/product.types";

export type Category = CategoryDto;

export interface CategoryListResponse {
  data: Category[];
  total: number;
}

/** GET /categories — full category list (no pagination) */
export async function fetchCategories(): Promise<CategoryListResponse> {
  const result = await ProductService.getCategories();
  return result.data;
}
