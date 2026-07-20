/**
 * hooks/useOrders.ts
 *
 * TanStack Query hooks for the admin order domain, mirroring useProducts.ts.
 *
 * Queries
 * ───────
 * useAdminOrders        — paginated, filtered admin list (loading / error / empty / stale)
 *
 * Mutations
 * ─────────
 * useUpdateOrderStatus  — PUT with optimistic single-item status patch
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { orderKeys } from "@/lib/queries/orders.keys";
import { customerKeys } from "@/lib/queries/customers.keys";
import {
  fetchAdminOrders,
  updateOrderStatus,
  type OrderFilters,
  type OrderListResponse,
} from "@/lib/api/orders.api";
import type { Order, OrderStatus } from "@/types/order.types";

/** Admin list: no stale time — always fresh (admins update statuses often) */
const ADMIN_LIST_STALE = 0;

// ---------------------------------------------------------------------------
// Admin — list
// ---------------------------------------------------------------------------

export function useAdminOrders(
  filters: OrderFilters = {},
  options?: Partial<UseQueryOptions<OrderListResponse>>
) {
  return useQuery<OrderListResponse>({
    queryKey: orderKeys.list(filters),
    queryFn: () => fetchAdminOrders(filters),
    staleTime: ADMIN_LIST_STALE,
    // Keeps previous page/tab data visible while the next one fetches,
    // preventing a full skeleton flash on every pagination/tab click.
    placeholderData: keepPreviousData,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Update order status — optimistic patch across every cached list
// ---------------------------------------------------------------------------

export function useUpdateOrderStatus() {
  const qc = useQueryClient();

  return useMutation<Order, Error, { id: string; status: OrderStatus }>({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),

    // ── Optimistic update ────────────────────────────────────────────────
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: orderKeys.lists() });

      const previousLists = qc.getQueriesData<OrderListResponse>({
        queryKey: orderKeys.lists(),
      });

      qc.setQueriesData<OrderListResponse>(
        { queryKey: orderKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((o) =>
              o.id === id ? { ...o, orderStatus: status } : o
            ),
          };
        }
      );

      return { previousLists };
    },

    // ── Rollback on error ────────────────────────────────────────────────
    onError: (_err, _vars, context) => {
      if (!context) return;
      const { previousLists } = context as {
        previousLists: [unknown, OrderListResponse | undefined][];
      };
      for (const [queryKey, data] of previousLists) {
        qc.setQueryData(queryKey as string[], data);
      }
    },

    // ── Targeted invalidation after server confirms ───────────────────────
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
      // The customer detail page embeds each customer's own order history —
      // keep it in sync when a status edit happens from that drawer too.
      qc.invalidateQueries({ queryKey: customerKeys.details() });
    },
  });
}
