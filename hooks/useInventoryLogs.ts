/**
 * hooks/useInventoryLogs.ts
 *
 * TanStack Query hook for the inventory-log domain, mirroring useProducts.ts.
 */

import {
  useQuery,
  keepPreviousData,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { inventoryLogKeys } from "@/lib/queries/inventory-log.keys";
import {
  fetchInventoryLogs,
  type InventoryLogFilters,
  type InventoryLogListResponse,
} from "@/lib/api/inventory-log.api";

/** Admin list: no stale time — always fresh */
const ADMIN_LIST_STALE = 0;

/**
 * Fetches a filtered, paginated list of inventory logs for the admin panel.
 */
export function useInventoryLogs(
  filters: InventoryLogFilters = {},
  options?: Partial<UseQueryOptions<InventoryLogListResponse>>
) {
  return useQuery<InventoryLogListResponse>({
    queryKey: inventoryLogKeys.list(filters),
    queryFn: () => fetchInventoryLogs(filters),
    staleTime: ADMIN_LIST_STALE,
    placeholderData: keepPreviousData,
    ...options,
  });
}
