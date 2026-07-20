/**
 * hooks/useCustomers.ts — TanStack Query hooks for admin customer domain, mirroring useOrders.ts.
 * Queries: useAdminCustomers (paginated/filtered list), useAdminCustomer (single detail)
 */

import {
  useQuery,
  keepPreviousData,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { customerKeys } from "@/lib/queries/customers.keys";
import {
  fetchAdminCustomers,
  fetchAdminCustomerById,
  type CustomerFilters,
  type CustomerListResponse,
} from "@/lib/api/customers.api";
import type { CustomerDetail } from "@/types/customer.types";

const ADMIN_LIST_STALE = 0;

export function useAdminCustomers(
  filters: CustomerFilters = {},
  options?: Partial<UseQueryOptions<CustomerListResponse>>
) {
  return useQuery<CustomerListResponse>({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchAdminCustomers(filters),
    staleTime: ADMIN_LIST_STALE,
    placeholderData: keepPreviousData, // prevents skeleton flash on pagination/tab/search
    ...options,
  });
}

export function useAdminCustomer(
  id: string,
  options?: Partial<UseQueryOptions<CustomerDetail>>
) {
  return useQuery<CustomerDetail>({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchAdminCustomerById(id),
    enabled: !!id,
    ...options,
  });
}
