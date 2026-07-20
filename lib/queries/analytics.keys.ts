/**
 * lib/queries/analytics.keys.ts
 *
 * Typed, hierarchical query-key factory for the admin analytics domain,
 * mirroring orders.keys.ts.
 */

export const analyticsKeys = {
  all: ["admin-analytics"] as const,

  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
} as const;
