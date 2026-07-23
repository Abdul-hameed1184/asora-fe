/**
 * lib/api/products.api.ts
 *
 * All product-domain API functions, colocated with their query/mutation keys.
 * These are plain async functions — TanStack Query calls them; components
 * never import axios or the client directly.
 */

import { ProductService } from "@/services/product.service";

// ---------------------------------------------------------------------------
// Shared domain types (mirrors backend schema exactly)
// ---------------------------------------------------------------------------

export interface MediaItem {
  id?: string;
  url: string;
  publicId: string;
  type: "image" | "video";
  format: string;
}

export interface Variant {
  id?: string;
  size: string;
  color: string;
  sku?: string;
  stock: number;
  price: number;
}

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  careGuide: string;
  sizeGuide: string;
  basePrice: number;
  categoryId: string;
  /** Flattened from the nested category object for display convenience */
  category: string;
  status: ProductStatus;
  isFeatured: boolean;
  featuredImage: string;
  media: MediaItem[];
  variants: Variant[];
  soldCount?: number;
  reviews?: Array<Record<string, unknown>>;
  createdAt?: string;
  updatedAt?: string;
  _count?: { reviews: number };
}

// ---------------------------------------------------------------------------
// Paginated list response envelope
// ---------------------------------------------------------------------------

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Query params for listing products
// ---------------------------------------------------------------------------

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  featured?: boolean;
  sortBy?: "createdAt" | "name" | "basePrice" | "soldCount";
  sortOrder?: "asc" | "desc";
  status?: ProductStatus;
}

// ---------------------------------------------------------------------------
// Mutation payloads
// ---------------------------------------------------------------------------

/** Variant shape accepted on write — unlike `Variant`, `price` is optional
 *  (backend defaults it to `basePrice` when omitted). */
export interface VariantInput {
  id?: string;
  size: string;
  color: string;
  stock: number;
  price?: number;
}

export type CreateProductPayload = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "_count" | "variants"
> & {
  variants: VariantInput[];
};

/** Variant shape accepted when PATCHING an existing product — every field
 *  except `id` is optional; only the fields actually changed need to be
 *  sent (mirrors the backend's `updateVariantSchema`). A row with no `id`
 *  is a brand-new variant and still needs `size`/`color`/`stock`. */
export interface VariantPatch {
  id?: string;
  size?: string;
  color?: string;
  stock?: number;
  price?: number;
}

/** PUT payload — a true partial patch. Only include the top-level fields
 *  that changed; `variants` (if present) only needs to carry `id` plus the
 *  fields that changed for that row. */
export type UpdateProductPayload = Partial<
  Omit<CreateProductPayload, "variants">
> & {
  variants?: VariantPatch[];
};

// ---------------------------------------------------------------------------
// ── Admin product API functions ──────────────────────────────────────────
// ---------------------------------------------------------------------------

/** GET /products — admin list with full filtering */
export async function fetchAdminProducts(
  filters: ProductFilters = {}
): Promise<ProductListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const result = await ProductService.getAll(params);
  return {
    data: result.data.data.map(normaliseProduct),
    pagination: result.data.pagination,
  };
}

/** GET /products/:id — full product detail for admin */
export async function fetchAdminProduct(id: string): Promise<Product> {
  const result = await ProductService.getById(id);
  return normaliseProduct(result.data);
}

/** POST /products — create a new product */
export async function createProduct(
  payload: CreateProductPayload
): Promise<Product> {
  const result = await ProductService.create(payload as Parameters<typeof ProductService.create>[0]);
  return normaliseProduct(result.data);
}

/** PUT /products/:id — update product details / stock */
export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<Product> {
  const result = await ProductService.update(id, payload as Parameters<typeof ProductService.update>[1]);
  return normaliseProduct(result.data);
}

/** DELETE /products/:id — soft delete (archives) */
export async function deleteProduct(id: string): Promise<void> {
  await ProductService.delete(id);
}

// ---------------------------------------------------------------------------
// ── Public/storefront product API functions ──────────────────────────────
// ---------------------------------------------------------------------------

/** GET /products/published — published products for storefront */
export async function fetchPublicProducts(
  filters: ProductFilters = {}
): Promise<ProductListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const result = await ProductService.getAllPublished(params);
  return {
    data: result.data.data.map(normaliseProduct),
    pagination: result.data.pagination,
  };
}

/** GET /products/:id/published — published product detail for storefront */
export async function fetchPublicProduct(id: string): Promise<Product> {
  const result = await ProductService.getPublishedById(id);
  return normaliseProduct(result.data);
}

// ---------------------------------------------------------------------------
// Helper — flatten nested category object so the rest of the UI only ever
// sees `product.category` as a plain string, matching the existing store type.
// ---------------------------------------------------------------------------
function normaliseProduct(raw: any): Product {
  const nested = raw.category as
    | { name: string; id?: string; slug?: string }
    | string
    | undefined;

  const categoryName =
    typeof nested === "object" && nested !== null
      ? nested.name
      : (nested as string | undefined) ?? "";

  const categoryId =
    (raw.categoryId as string | undefined) ??
    (typeof nested === "object" && nested !== null ? nested.id ?? "" : "");

  return {
    ...(raw as unknown as Product),
    category: categoryName,
    categoryId,
  };
}
