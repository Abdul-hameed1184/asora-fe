"use client";

import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { AddToCartPayload, Cart, CartItem } from "@/lib/api/cart.api";
import { CartService } from "@/services/cart.service";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { ApiSuccess } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// GET /cart
// ---------------------------------------------------------------------------

export function useGetCart() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  return useApiQuery<Cart>({
    queryKey: ["cart"],
    queryFn: CartService.getCart,
    enabled: _hasHydrated && isAuthenticated,
    retry: (failureCount, error) => {
      // Cart not found (new user) — don't retry, show empty state instead.
      if (error instanceof ApiError && (error as ApiError).statusCode === 404)
        return false;
      return failureCount < 2;
    },
  });
}

// ---------------------------------------------------------------------------
// POST /cart
// ---------------------------------------------------------------------------

export function useAddToCart() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, user } = useAuthStore();

  const { mutate, isPending, error } = useApiMutation<
    ApiSuccess<CartItem>,
    AddToCartPayload
  >({
    mutationFn: CartService.addToCart,
    invalidateKeys: [["cart"]],
  });

  function submit(payload: AddToCartPayload) {
    if (!_hasHydrated || !isAuthenticated) {
      toast.error("Please log in to add items to your cart");
      router.push("/login");
      return;
    }
    if (!user?.isVerified) {
      toast.error("Please verify your email to add items to your cart");
      return;
    }
    mutate(payload, {
      onSuccess(result) {
        toast.success(result.message ?? "Added to cart!");
      },
    });
  }

  return { submit, isPending, error: error as ApiError | null };
}

// ---------------------------------------------------------------------------
// PUT /cart/:variantId
// ---------------------------------------------------------------------------

type UpdateCartPayload = { variantId: string; quantity: number };

export function useUpdateCart() {
  const { mutate, isPending, variables } = useApiMutation<
    ApiSuccess<CartItem>,
    UpdateCartPayload
  >({
    mutationFn: ({ variantId, quantity }) =>
      CartService.updateCartItem(variantId, quantity),
    invalidateKeys: [["cart"]],
  });

  function update(variantId: string, quantity: number) {
    mutate({ variantId, quantity });
  }

  return {
    update,
    isPending,
    // Which variant is currently being updated (to disable only that row).
    pendingVariantId: isPending ? (variables?.variantId ?? null) : null,
  };
}

// ---------------------------------------------------------------------------
// DELETE /cart/:variantId
// ---------------------------------------------------------------------------

export function useRemoveFromCart() {
  const { mutate, isPending, variables } = useApiMutation<
    ApiSuccess<null>,
    string
  >({
    mutationFn: CartService.removeFromCart,
    invalidateKeys: [["cart"]],
  });

  function remove(variantId: string) {
    mutate(variantId, {
      onSuccess() {
        toast.success("Item removed");
      },
    });
  }

  return {
    remove,
    isPending,
    pendingVariantId: isPending ? (variables ?? null) : null,
  };
}
