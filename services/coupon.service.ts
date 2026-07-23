import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  CouponListParams,
  CouponListResponse,
} from "@/types/coupon.types";

export class CouponService {
  static async list(params?: CouponListParams) {
    const response = await apiClient.get<ApiSuccess<CouponListResponse>>("/admin/coupons", {
      params,
    });
    return response.data;
  }

  static async getById(id: string) {
    const response = await apiClient.get<ApiSuccess<Coupon>>(`/admin/coupons/${id}`);
    return response.data;
  }

  static async create(data: CreateCouponDto) {
    const response = await apiClient.post<ApiSuccess<Coupon>>("/admin/coupons", data);
    return response.data;
  }

  static async update(id: string, data: UpdateCouponDto) {
    const response = await apiClient.put<ApiSuccess<Coupon>>(`/admin/coupons/${id}`, data);
    return response.data;
  }

  static async delete(id: string) {
    const response = await apiClient.delete<ApiSuccess<null>>(`/admin/coupons/${id}`);
    return response.data;
  }

  static async activate(id: string) {
    const response = await apiClient.patch<ApiSuccess<Coupon>>(`/admin/coupons/${id}/activate`);
    return response.data;
  }

  static async deactivate(id: string) {
    const response = await apiClient.patch<ApiSuccess<Coupon>>(`/admin/coupons/${id}/deactivate`);
    return response.data;
  }

  static async expire(id: string) {
    const response = await apiClient.patch<ApiSuccess<Coupon>>(`/admin/coupons/${id}/expire`);
    return response.data;
  }
}
