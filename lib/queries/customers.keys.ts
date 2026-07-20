/**
 * lib/queries/customers.keys.ts
 * Typed, hierarchical query-key factory for the admin customer domain, mirroring orders.keys.ts.
 */

import type { CustomerFilters } from "@/lib/api/customers.api";

export const customerKeys = {
  all: ["admin-customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
} as const;
