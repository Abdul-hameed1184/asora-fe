"use client";

import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks/useApiMutation";
import { addToCart, AddToCartPayload, CartItem } from "@/lib/api/cart.api";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { ApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

export function useAddToCart() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { mutate, isPending, error } = useApiMutation<CartItem, AddToCartPayload>({
    mutationFn: addToCart,
    invalidateKeys: [["cart"]],
  });

  function submit(payload: AddToCartPayload) {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart");
      router.push("/login");
      return;
    }
    mutate(payload, {
      onSuccess() {
        toast.success("Added to cart!");
      },
    });
  }

  return {
    submit,
    isPending,
    error: error as ApiError | null,
  };
}
