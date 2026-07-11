import { apiClient } from "@/lib/api/client";

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

export interface CartItem {
  variantId: string;
  quantity: number;
}

export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  const res = await apiClient.post<{ data: CartItem }>("/cart", payload);
  return res.data.data;
}


export async function getUserCart() {
  const res = await apiClient.get<{ data: CartItem }>("/cart");
  return res.data.data;
}

export async function updateCart(payload: AddToCartPayload) {

}

export async function deleteCart() {

}