/**
 * lib/stores/useOrderDrawerStore.ts
 *
 * UI-only store — controls the order drawer's open/close state and which
 * order is currently being viewed. No server data lives here; `activeOrder`
 * is only a reference to whichever row the user clicked — the source of
 * truth is the TanStack Query cache (see hooks/useOrders.ts).
 */

import { create } from "zustand";
import type { Order } from "@/types/order.types";

interface OrderDrawerState {
  isOpen: boolean;
  activeOrder: Order | null;

  /** Open the drawer for a given order */
  open: (order: Order) => void;
  /** Close the drawer */
  close: () => void;
}

export const useOrderDrawerStore = create<OrderDrawerState>((set) => ({
  isOpen: false,
  activeOrder: null,

  open: (order) => set({ isOpen: true, activeOrder: order }),

  close: () => set({ isOpen: false, activeOrder: null }),
}));
