/**
 * lib/queries/coupon.keys.ts
 *
 * Typed query-key factory for the coupon domain, mirroring products.keys.ts.
 */

import type { CouponListParams } from "@/types/coupon.types";

export const couponKeys = {
  all: ["coupons"] as const,

  lists: () => [...couponKeys.all, "list"] as const,

  list: (params: CouponListParams) => [...couponKeys.lists(), params] as const,

  details: () => [...couponKeys.all, "detail"] as const,

  detail: (id: string) => [...couponKeys.details(), id] as const,
} as const;
