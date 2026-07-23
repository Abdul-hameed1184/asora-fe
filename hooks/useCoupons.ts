/**
 * hooks/useCoupons.ts
 *
 * TanStack Query hooks for the coupon domain (admin). Mirrors
 * useCategories.ts's simple invalidate-on-success mutation style — coupons
 * are a low-frequency admin list, so optimistic updates (as used for
 * products) aren't warranted here.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { couponKeys } from "@/lib/queries/coupon.keys";
import { CouponService } from "@/services/coupon.service";
import {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  CouponListParams,
  CouponListResponse,
} from "@/types/coupon.types";

export function useCoupons(params: CouponListParams = {}) {
  return useQuery<CouponListResponse>({
    queryKey: couponKeys.list(params),
    queryFn: () => CouponService.list(params).then((res) => res.data),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();

  return useMutation<Coupon, Error, CreateCouponDto>({
    mutationFn: (data) => CouponService.create(data).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();

  return useMutation<Coupon, Error, { id: string; data: UpdateCouponDto }>({
    mutationFn: ({ id, data }) => CouponService.update(id, data).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();

  return useMutation<null, Error, string>({
    mutationFn: (id) => CouponService.delete(id).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useActivateCoupon() {
  const qc = useQueryClient();

  return useMutation<Coupon, Error, string>({
    mutationFn: (id) => CouponService.activate(id).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useDeactivateCoupon() {
  const qc = useQueryClient();

  return useMutation<Coupon, Error, string>({
    mutationFn: (id) => CouponService.deactivate(id).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useExpireCoupon() {
  const qc = useQueryClient();

  return useMutation<Coupon, Error, string>({
    mutationFn: (id) => CouponService.expire(id).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}
