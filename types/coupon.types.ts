export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchase: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usagePerCustomer: number | null;
  status: CouponStatus;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  status?: CouponStatus;
  startsAt: string;
  expiresAt: string;
}

export interface UpdateCouponDto {
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usagePerCustomer?: number;
  status?: CouponStatus;
  startsAt?: string;
  expiresAt?: string;
}

export interface CouponListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CouponStatus;
  discountType?: DiscountType;
  sortBy?: "createdAt" | "expiresAt" | "discountValue" | "code";
  sortOrder?: "asc" | "desc";
}

export interface CouponPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CouponListResponse {
  data: Coupon[];
  pagination: CouponPagination;
}
