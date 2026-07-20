/**
 * lib/api/orders.api.ts
 *
 * Admin order-domain API functions, mirroring the products.api.ts pattern.
 * Plain async functions — TanStack Query calls them; components never
 * import axios or the OrderService directly.
 *
 * Note: the `/orders/admin/all` and `/orders/:id/status` endpoints respond
 * with `{ status, data, pagination }` — NOT the `{ success, message, data, meta }`
 * envelope that `PaginatedResponse<T>` assumes. We read the real field names
 * here rather than trusting that type.
 */

import { OrderService } from "@/services/order.service";
import type {
  Order,
  OrderStatus,
  GetAdminOrdersParams,
} from "@/types/order.types";

// ---------------------------------------------------------------------------
// Paginated list response envelope
// ---------------------------------------------------------------------------

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface OrderListResponse {
  data: Order[];
  pagination: Pagination;
}

export type OrderFilters = GetAdminOrdersParams;

// ---------------------------------------------------------------------------
// Helper — Order money fields (subtotal/shippingFee/discount/totalAmount) are
// Prisma `Decimal` columns that serialize as strings over the wire; coerce
// them to numbers so the UI can format/compare them directly.
// ---------------------------------------------------------------------------
function normaliseOrder(raw: Order): Order {
  return {
    ...raw,
    subtotal: Number(raw.subtotal),
    shippingFee: Number(raw.shippingFee),
    discount: Number(raw.discount),
    totalAmount: Number(raw.totalAmount),
  };
}

// ---------------------------------------------------------------------------
// ── Admin order API functions ────────────────────────────────────────────
// ---------------------------------------------------------------------------

/** GET /orders/admin/all — paginated, filterable admin order list */
export async function fetchAdminOrders(
  filters: OrderFilters = {}
): Promise<OrderListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );

  const result = (await OrderService.getAdminOrders(params)) as unknown as {
    data: Order[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  };

  const { pagination } = result;

  return {
    data: result.data.map(normaliseOrder),
    pagination: {
      ...pagination,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };
}

/** GET /orders/admin/:id — single order, any owner (admin) */
export async function fetchAdminOrderById(id: string): Promise<Order> {
  const result = (await OrderService.getAdminOrderById(id)) as unknown as {
    data: Order;
  };
  return normaliseOrder(result.data);
}

/** PUT /orders/:id/status — update an order's status (admin) */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const result = await OrderService.updateStatus(id, { status });
  return normaliseOrder(result.data);
}
