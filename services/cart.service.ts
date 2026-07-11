import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { AddToCartPayload, CartItem } from "@/lib/api/cart.api";

export class CartService {
  static async addToCart(payload: AddToCartPayload): Promise<ApiSuccess<CartItem>> {
    const res = await apiClient.post<ApiSuccess<CartItem>>("/cart", payload);
    return res.data;
  }

  static async getCart(): Promise<ApiSuccess<unknown>> {
    const res = await apiClient.get<ApiSuccess<unknown>>("/cart");
    return res.data;
  }
}
