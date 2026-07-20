/**
 * hooks/useAnalytics.ts
 *
 * TanStack Query hook for the admin analytics domain, mirroring useOrders.ts.
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { analyticsKeys } from "@/lib/queries/analytics.keys";
import { fetchDashboardAnalytics } from "@/lib/api/analytics.api";
import type { DashboardAnalytics } from "@/types/analytics.types";

/** Admin dashboard: no stale time — always fresh */
const ADMIN_DASHBOARD_STALE = 0;

export function useDashboardAnalytics(
  options?: Partial<UseQueryOptions<DashboardAnalytics>>
) {
  return useQuery<DashboardAnalytics>({
    queryKey: analyticsKeys.dashboard(),
    queryFn: fetchDashboardAnalytics,
    staleTime: ADMIN_DASHBOARD_STALE,
    ...options,
  });
}
