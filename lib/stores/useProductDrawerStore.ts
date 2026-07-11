/**
 * lib/stores/useProductDrawerStore.ts
 *
 * UI-only store — controls drawer open/close state and which product is
 * currently being edited.
 *
 * IMPORTANT: This store holds NO server data.  `activeProduct` is only
 * a reference to whichever product the user clicked — the source of truth
 * for that product lives in the TanStack Query cache.  Server reads/writes
 * are handled exclusively in lib/queries/useProducts.ts.
 */

import { create } from "zustand";

// Re-export domain types from the canonical API layer so the rest of the app
// only needs to import from this one location.
export type {
  MediaItem,
  Variant,
  Product,
} from "@/lib/api/products.api";

// ---------------------------------------------------------------------------
// Drawer store — purely UI state
// ---------------------------------------------------------------------------

type DrawerMode = "new-product" | "manage-stock";

// Import Product type locally for the store interface
import type { Product } from "@/lib/api/products.api";

interface ProductDrawerState {
  isOpen: boolean;
  mode: DrawerMode;
  activeProduct: Product | null;

  /** Open the drawer in "new product" mode (empty form) */
  openNew: () => void;
  /** Open the drawer in "manage stock" mode (form pre-populated) */
  openManageStock: (product: Product) => void;
  /** Close the drawer */
  close: () => void;
}

export const useProductDrawerStore = create<ProductDrawerState>((set) => ({
  isOpen: false,
  mode: "new-product",
  activeProduct: null,

  openNew: () =>
    set({ isOpen: true, mode: "new-product", activeProduct: null }),

  openManageStock: (product) =>
    set({ isOpen: true, mode: "manage-stock", activeProduct: product }),

  close: () => set({ isOpen: false, activeProduct: null }),
}));
