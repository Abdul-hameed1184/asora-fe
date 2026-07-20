/**
 * lib/queries/orders.keys.ts
 *
 * Typed, hierarchical query-key factory for the admin order domain,
 * mirroring products.keys.ts.
 */

import type { OrderFilters } from "@/lib/api/orders.api";

export const orderKeys = {
  all: ["admin-orders"] as const,

  lists: () => [...orderKeys.all, "list"] as const,

  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
} as const;
