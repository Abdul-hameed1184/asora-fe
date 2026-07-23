import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";

export interface ValidateCouponPayload {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResult {
  code: string;
  discount: number;
}

export class CouponValidationService {
  static async validate(payload: ValidateCouponPayload) {
    const response = await apiClient.post<ApiSuccess<ValidateCouponResult>>(
      "/coupons/validate",
      payload,
    );
    return response.data;
  }
}
