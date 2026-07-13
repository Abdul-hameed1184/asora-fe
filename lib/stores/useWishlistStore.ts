import { create } from "zustand";

interface WishlistState {
  productIds: Set<string>;
  setWishlist: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: new Set(),

  setWishlist: (ids) => set({ productIds: new Set(ids) }),

  add: (id) =>
    set((s) => ({ productIds: new Set([...s.productIds, id]) })),

  remove: (id) =>
    set((s) => {
      const next = new Set(s.productIds);
      next.delete(id);
      return { productIds: next };
    }),

  has: (id) => get().productIds.has(id),

  clear: () => set({ productIds: new Set() }),
}));
