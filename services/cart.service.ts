import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { AddToCartPayload, Cart, CartItem } from "@/lib/api/cart.api";

export class CartService {
  static async addToCart(payload: AddToCartPayload): Promise<ApiSuccess<CartItem>> {
    const res = await apiClient.post<ApiSuccess<CartItem>>("/cart", payload);
    return res.data;
  }

  // Returns the extracted cart data — callers use it directly in queries.
  static async getCart(): Promise<Cart> {
    const res = await apiClient.get<ApiSuccess<Cart>>("/cart");
    return res.data.data;
  }

  // PUT /cart/:variantId  { quantity }
  static async updateCartItem(
    variantId: string,
    quantity: number
  ): Promise<ApiSuccess<CartItem>> {
    const res = await apiClient.put<ApiSuccess<CartItem>>(
      `/cart/${variantId}`,
      { quantity }
    );
    return res.data;
  }

  // DELETE /cart/:variantId
  static async removeFromCart(variantId: string): Promise<ApiSuccess<null>> {
    const res = await apiClient.delete<ApiSuccess<null>>(`/cart/${variantId}`);
    return res.data;
  }
}
