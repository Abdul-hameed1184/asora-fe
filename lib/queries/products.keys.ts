/**
 * lib/queries/products.keys.ts
 *
 * Typed, hierarchical query-key factory for the product domain.
 *
 * All keys are derived from the root `["products"]` tuple so that a single
 * `queryClient.invalidateQueries({ queryKey: productKeys.all })` call
 * efficiently busts the entire product cache after writes.
 *
 * Key structure (from broadest → narrowest):
 *
 *   all            → ["products"]
 *   lists          → ["products", "list"]
 *   list(filters)  → ["products", "list", { ...filters }]
 *   details        → ["products", "detail"]
 *   detail(id)     → ["products", "detail", id]
 *
 * Public (storefront) keys live under a separate "public" segment so admin
 * invalidation never accidentally evicts storefront cache.
 *
 *   publicLists          → ["products", "public", "list"]
 *   publicList(filters)  → ["products", "public", "list", { ...filters }]
 *   publicDetails        → ["products", "public", "detail"]
 *   publicDetail(id)     → ["products", "public", "detail", id]
 */

import type { ProductFilters } from "@/lib/api/products.api";

export const productKeys = {
  /** Root — invalidates everything in the product domain */
  all: ["products"] as const,

  // ── Admin ──────────────────────────────────────────────────────────────

  /** Scope: all admin list queries */
  lists: () => [...productKeys.all, "list"] as const,

  /** Scope: one specific filtered admin list */
  list: (filters: ProductFilters) =>
    [...productKeys.lists(), filters] as const,

  /** Scope: all admin detail queries */
  details: () => [...productKeys.all, "detail"] as const,

  /** Scope: one admin product detail */
  detail: (id: string) => [...productKeys.details(), id] as const,

  // ── Public / storefront ────────────────────────────────────────────────

  publicLists: () => [...productKeys.all, "public", "list"] as const,

  publicList: (filters: ProductFilters) =>
    [...productKeys.publicLists(), filters] as const,

  publicDetails: () => [...productKeys.all, "public", "detail"] as const,

  publicDetail: (id: string) => [...productKeys.publicDetails(), id] as const,
} as const;
