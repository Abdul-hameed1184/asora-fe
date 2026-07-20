/**
 * lib/api/analytics.api.ts
 *
 * Admin analytics-domain API functions, mirroring the orders.api.ts pattern.
 * Plain async functions — TanStack Query calls them; components never
 * import axios or the AnalyticsService directly.
 *
 * Note: `/analytics/dashboard` responds with `{ status, message, data }` —
 * NOT the `{ success, message, data }` envelope that `ApiSuccess<T>` assumes.
 * We read the real field names here rather than trusting that type.
 */

import { AnalyticsService } from "@/services/analytics.service";
import type { DashboardAnalytics } from "@/types/analytics.types";

/**
 * `recentOrders[].totalAmount` is a Prisma `Decimal` column that serialises
 * as a string over the wire (same as Order.totalAmount — see orders.api.ts's
 * `normaliseOrder`); coerce it so the UI can format it directly.
 */
function normaliseDashboard(raw: DashboardAnalytics): DashboardAnalytics {
  return {
    ...raw,
    recentOrders: raw.recentOrders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    })),
  };
}

/** GET /analytics/dashboard — aggregate admin dashboard metrics */
export async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const result = (await AnalyticsService.getDashboard()) as unknown as {
    data: DashboardAnalytics;
  };

  return normaliseDashboard(result.data);
}
