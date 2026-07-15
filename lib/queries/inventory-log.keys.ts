/**
 * lib/queries/inventory-log.keys.ts
 *
 * Typed, hierarchical query-key factory for the inventory-log domain,
 * mirroring products.keys.ts.
 */

import type { InventoryLogFilters } from "@/lib/api/inventory-log.api";

export const inventoryLogKeys = {
  all: ["inventory-logs"] as const,

  lists: () => [...inventoryLogKeys.all, "list"] as const,

  list: (filters: InventoryLogFilters) =>
    [...inventoryLogKeys.lists(), filters] as const,
} as const;
