import { useEffect } from "react";
import toast from "react-hot-toast";
import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { UserService } from "@/services/user.service";
import { QUERY_KEYS } from "./queryKeys";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useWishlistStore } from "@/lib/stores/useWishlistStore";
import type { ApiSuccess } from "@/types/api.types";
import type { WishlistItem } from "@/types/user.type";

export function useWishlist() {
  const { user } = useAuthStore();
  const { setWishlist, add, remove, has, clear } = useWishlistStore();

  const { data, isLoading } = useApiQuery<ApiSuccess<{ items: WishlistItem[] }>>({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: () => UserService.getWishlist(),
    enabled: !!user,
  });

  const wishlistItems = Array.isArray(data?.data?.items) ? data.data.items : [];

  // Seed the Zustand store whenever the server response arrives
  useEffect(() => {
    if (data?.data?.items) {
      setWishlist(data.data.items.map((item) => item.productId));
    }
  }, [data, setWishlist]);

  // Clear local store on logout
  useEffect(() => {
    if (!user) clear();
  }, [user, clear]);

  const { mutate: addToWishlist, isPending: adding } = useApiMutation<unknown, string>({
    mutationFn: (productId) => UserService.addToWishlist(productId),
    invalidateKeys: [QUERY_KEYS.wishlist],
  });

  const { mutate: removeFromWishlist, isPending: removing } = useApiMutation<unknown, string>({
    mutationFn: (productId) => UserService.removeFromWishlist(productId),
    invalidateKeys: [QUERY_KEYS.wishlist],
  });

  const isWishlisted = (productId: string) => has(productId);

  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast.error("Please sign in to save items to your wishlist");
      return;
    }

    if (has(productId)) {
      remove(productId); // optimistic
      removeFromWishlist(productId, {
        onSuccess: () => toast.success("Removed from wishlist"),
        onError: () => {
          add(productId); // rollback
          toast.error("Failed to remove from wishlist");
        },
      });
    } else {
      add(productId); // optimistic
      addToWishlist(productId, {
        onSuccess: () => toast.success("Added to wishlist"),
        onError: () => {
          remove(productId); // rollback
          toast.error("Failed to add to wishlist");
        },
      });
    }
  };

  return {
    wishlistItems,
    isWishlisted,
    toggleWishlist,
    isLoading,
    isPending: adding || removing,
  };
}
