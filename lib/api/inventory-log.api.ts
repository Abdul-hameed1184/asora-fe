/**
 * lib/api/inventory-log.api.ts
 *
 * Inventory-log domain API functions, mirroring the products.api.ts pattern.
 * Plain async functions — TanStack Query calls them; components never
 * import axios or the client directly.
 */

import { InventoryLogService } from "@/services/inventory-log.service";

// ---------------------------------------------------------------------------
// Shared domain types (mirrors backend InventoryLog model exactly)
// ---------------------------------------------------------------------------

export type InventoryMovementType = "IN" | "OUT";

export type InventoryReason =
  | "INITIAL_STOCK"
  | "PURCHASE_ORDER"
  | "STOCK_RETURN"
  | "DAMAGED_ITEM"
  | "SALES_ORDER"
  | "REFUND"
  | "INVENTORY_ADJUSTMENT"
  | "MANUAL_CORRECTION"
  | "RECOUNT"
  | "TRANSFER";

export interface InventoryLogVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  product?: { id: string; name: string };
}

export interface InventoryLog {
  id: string;
  variantId: string;
  variant: InventoryLogVariant;
  type: InventoryMovementType;
  reason: InventoryReason;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId?: string | null;
  referenceType?: string | null;
  performedById?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

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

export interface InventoryLogListResponse {
  data: InventoryLog[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Query params for listing inventory logs
// ---------------------------------------------------------------------------

export interface InventoryLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  variantId?: string;
  type?: InventoryMovementType;
  reason?: InventoryReason;
  referenceType?: string;
  sortOrder?: "asc" | "desc";
}

// ---------------------------------------------------------------------------
// ── Admin inventory-log API functions ────────────────────────────────────
// ---------------------------------------------------------------------------

/** GET /inventory-logs — admin list with full filtering */
export async function fetchInventoryLogs(
  filters: InventoryLogFilters = {}
): Promise<InventoryLogListResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
  );
  const result = await InventoryLogService.getAll(params);
  return result.data as InventoryLogListResponse;
}
