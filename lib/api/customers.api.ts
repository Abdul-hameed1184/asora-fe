/**
 * lib/api/customers.api.ts
 *
 * Admin customer-domain API functions, mirroring the orders.api.ts pattern.
 * Plain async functions — TanStack Query calls them; components never
 * import axios or the CustomerService directly.
 *
 * Note: `/users/admin/all` and `/users/admin/:id` respond with
 * `{ status, data[, pagination] }` — NOT the `{ success, message, data, meta }`
 * envelope that `PaginatedResponse<T>`/`ApiSuccess<T>` assume. We read the
 * real field names here rather than trusting those types.
 */

import { CustomerService } from "@/services/customer.service";
import type {
  Customer,
  CustomerDetail,
  GetAdminCustomersParams,
} from "@/types/customer.types";

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CustomerListResponse {
  data: Customer[];
  pagination: Pagination;
}

export type CustomerFilters = GetAdminCustomersParams;

/** GET /users/admin/all — paginated, filterable admin customer list */
export async function fetchAdminCustomers(
  filters: CustomerFilters = {}
): Promise<CustomerListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );

  const result = (await CustomerService.getAdminCustomers(params)) as unknown as {
    data: Customer[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  };

  const { pagination } = result;

  return {
    data: result.data,
    pagination: {
      ...pagination,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };
}

/** GET /users/admin/:id — single customer profile, order history, and addresses */
export async function fetchAdminCustomerById(id: string): Promise<CustomerDetail> {
  const result = (await CustomerService.getAdminCustomerById(id)) as unknown as {
    data: CustomerDetail;
  };

  return result.data;
}
