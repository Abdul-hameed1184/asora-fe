/**
 * lib/queries/useProducts.ts
 *
 * All TanStack Query hooks for the product domain.
 *
 * Queries
 * ───────
 * useAdminProducts     — paginated, filtered admin list (loading / error / empty / stale)
 * useAdminProduct      — single product detail (admin)
 * usePublicProducts    — storefront list
 * usePublicProduct     — storefront detail
 *
 * Mutations
 * ─────────
 * useCreateProduct     — POST with optimistic list prepend
 * useUpdateProduct     — PUT with optimistic single-item update
 * useDeleteProduct     — DELETE with optimistic list removal
 *
 * Design decisions
 * ────────────────
 * • Server state lives exclusively in the Query cache — no Zustand for data.
 * • `staleTime` is set per-query to control background refetch frequency.
 * • `placeholderData: keepPreviousData` on paginated lists eliminates
 *   loading flicker during page / filter changes.
 * • Optimistic updates write to the cache immediately; the rollback context
 *   restores the previous snapshot on error.
 * • Targeted invalidation after writes hits only affected cache entries, not
 *   the entire application cache.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { productKeys } from "@/lib/queries/products.keys";
import {
  fetchAdminProducts,
  fetchAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchPublicProducts,
  fetchPublicProduct,
  type Product,
  type ProductFilters,
  type ProductListResponse,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/lib/api/products.api";
import { useApiQuery } from "./useApiQuery";

// ---------------------------------------------------------------------------
// Stale-time constants
// ---------------------------------------------------------------------------
/** Admin list: no stale time — always fresh (admins write frequently) */
const ADMIN_LIST_STALE = 0;
/** Admin detail: 30 s */
const ADMIN_DETAIL_STALE = 30_000;
/** Public list: 15 min (matches caching recommendation in API spec) */
const PUBLIC_LIST_STALE = 15 * 60_000;
/** Public detail: 60 min */
const PUBLIC_DETAIL_STALE = 60 * 60_000;

// ===========================================================================
// ── Queries ─────────────────────────────────────────────────────────────────
// ===========================================================================

// ---------------------------------------------------------------------------
// Admin — list
// ---------------------------------------------------------------------------

/**
 * Fetches a filtered, paginated list of products for the admin panel.
 *
 * States surfaced:
 *   isPending      → first-ever load (show skeleton)
 *   isFetching     → background refetch (show subtle spinner)
 *   isStale        → data is older than staleTime (TQ will refetch on mount)
 *   isError        → network / server error (show error UI)
 *   data?.data.length === 0 → empty (show empty state)
 */
export function useAdminProducts(
  filters: ProductFilters = {},
  options?: Partial<UseQueryOptions<ProductListResponse>>
) {
  return useQuery<ProductListResponse>({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchAdminProducts(filters),
    staleTime: ADMIN_LIST_STALE,
    // Keeps previous page data visible while a new page/filter is fetching,
    // preventing a full skeleton flash on every pagination click.
    placeholderData: keepPreviousData,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Admin — detail
// ---------------------------------------------------------------------------

/**
 * Fetches a single product by ID for the admin panel.
 * Disabled when no ID is provided (e.g. drawer is in "new" mode).
 */
export function useAdminProduct(
  id: string | null | undefined,
  options?: Partial<UseQueryOptions<Product>>
) {
  return useQuery<Product>({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => fetchAdminProduct(id!),
    enabled: Boolean(id),
    staleTime: ADMIN_DETAIL_STALE,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Public — list
// ---------------------------------------------------------------------------

/**
 * Fetches published products for the customer storefront.
 * Long staleTime because these change infrequently from the customer's POV.
 */
export function usePublicProducts(
  filters: ProductFilters = {},
  options?: Partial<UseQueryOptions<ProductListResponse>>
) {
  return useApiQuery<ProductListResponse>({
    queryKey: productKeys.publicList(filters),
    queryFn: () => fetchPublicProducts(filters),
    staleTime: PUBLIC_LIST_STALE,
    placeholderData: keepPreviousData,
    ...options,
  });
}


// ---------------------------------------------------------------------------
// Public — detail
// ---------------------------------------------------------------------------

export function usePublicProduct(
  id: string | null | undefined,
  options?: Partial<UseQueryOptions<Product>>
) {
  return useQuery<Product>({
    queryKey: productKeys.publicDetail(id ?? ""),
    queryFn: () => fetchPublicProduct(id!),
    enabled: Boolean(id),
    staleTime: PUBLIC_DETAIL_STALE,
    ...options,
  });
}

// ===========================================================================
// ── Mutations ────────────────────────────────────────────────────────────────
// ===========================================================================

// ---------------------------------------------------------------------------
// Create product — optimistic list prepend
// ---------------------------------------------------------------------------

export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation<Product, Error, CreateProductPayload>({
    mutationFn: createProduct,

    // ── Optimistic update ────────────────────────────────────────────────
    onMutate: async (newProduct) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update.
      await qc.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot all matching list caches so we can roll back on error.
      const previousLists = qc.getQueriesData<ProductListResponse>({
        queryKey: productKeys.lists(),
      });

      // Optimistically prepend a placeholder product to every cached list.
      const optimisticProduct: Product = {
        id: `optimistic-${Date.now()}`,
        ...newProduct,
        createdAt: new Date().toISOString(),
      };

      qc.setQueriesData<ProductListResponse>(
        { queryKey: productKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [optimisticProduct, ...old.data],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // Return snapshot as context for rollback.
      return { previousLists };
    },

    // ── Rollback on error ────────────────────────────────────────────────
    onError: (_err, _vars, context) => {
      if (!context) return;
      const { previousLists } = context as {
        previousLists: [unknown, ProductListResponse | undefined][];
      };
      for (const [queryKey, data] of previousLists) {
        qc.setQueryData(queryKey as string[], data);
      }
    },

    // ── Targeted invalidation after server confirms ───────────────────────
    onSuccess: () => {
      // Invalidate admin lists only — public cache has its own staleTime.
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Update product — optimistic single-item patch
// ---------------------------------------------------------------------------

export function useUpdateProduct() {
  const qc = useQueryClient();

  return useMutation<
    Product,
    Error,
    { id: string; payload: UpdateProductPayload }
  >({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),

    // ── Optimistic update ────────────────────────────────────────────────
    onMutate: async ({ id, payload }) => {
      // Prevent race with ongoing refetch of this detail query.
      await qc.cancelQueries({ queryKey: productKeys.detail(id) });
      await qc.cancelQueries({ queryKey: productKeys.lists() });

      // Snapshot for rollback.
      const previousDetail = qc.getQueryData<Product>(
        productKeys.detail(id)
      );
      const previousLists = qc.getQueriesData<ProductListResponse>({
        queryKey: productKeys.lists(),
      });

      // Patch the detail cache immediately.
      if (previousDetail) {
        qc.setQueryData<Product>(productKeys.detail(id), (old) =>
          old ? { ...old, ...payload } : old
        );
      }

      // Patch the product inside every list snapshot.
      qc.setQueriesData<ProductListResponse>(
        { queryKey: productKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.id === id ? { ...p, ...payload } : p
            ),
          };
        }
      );

      return { previousDetail, previousLists };
    },

    // ── Rollback ─────────────────────────────────────────────────────────
    onError: (_err, { id }, context) => {
      if (!context) return;
      const { previousDetail, previousLists } = context as {
        previousDetail: Product | undefined;
        previousLists: [unknown, ProductListResponse | undefined][];
      };

      if (previousDetail) {
        qc.setQueryData(productKeys.detail(id), previousDetail);
      }
      for (const [queryKey, data] of previousLists) {
        qc.setQueryData(queryKey as string[], data);
      }
    },

    // ── Targeted invalidation ─────────────────────────────────────────────
    onSuccess: (_data, { id }) => {
      // Refresh only this item's detail + all admin lists.
      qc.invalidateQueries({ queryKey: productKeys.detail(id) });
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Delete product — optimistic list removal
// ---------------------------------------------------------------------------

export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteProduct,

    // ── Optimistic removal ───────────────────────────────────────────────
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: productKeys.lists() });

      const previousLists = qc.getQueriesData<ProductListResponse>({
        queryKey: productKeys.lists(),
      });

      qc.setQueriesData<ProductListResponse>(
        { queryKey: productKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((p) => p.id !== id),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
      );

      return { previousLists };
    },

    // ── Rollback ─────────────────────────────────────────────────────────
    onError: (_err, _id, context) => {
      if (!context) return;
      const { previousLists } = context as {
        previousLists: [unknown, ProductListResponse | undefined][];
      };
      for (const [queryKey, data] of previousLists) {
        qc.setQueryData(queryKey as string[], data);
      }
    },

    // ── Targeted invalidation ─────────────────────────────────────────────
    onSuccess: (_data, id) => {
      // Remove the detail entry entirely and refetch lists.
      qc.removeQueries({ queryKey: productKeys.detail(id) });
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
