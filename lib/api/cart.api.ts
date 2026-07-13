import { apiClient } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Rich types that mirror what GET /cart returns (cart + items + variant + product)
// ---------------------------------------------------------------------------

export interface CartProduct {
  id: string;
  name: string;
  basePrice: number;
  featuredImage: string;
  media: Array<{ url: string; publicId: string; type: string; format: string }>;
}

export interface CartVariant {
  id: string;
  size: string;
  color: string;
  sku?: string;
  stock: number;
  price: number;
  product: CartProduct;
}

export interface CartLineItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartVariant;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartLineItem[];
}

// Minimal record returned by add / update mutations
export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function addToCart(payload: AddToCartPayload): Promise<CartItem> {
  const res = await apiClient.post<{ data: CartItem }>("/cart", payload);
  return res.data.data;
}

export async function getUserCart(): Promise<Cart> {
  const res = await apiClient.get<{ data: Cart }>("/cart");
  return res.data.data;
}

export async function updateCartItem(
  variantId: string,
  quantity: number
): Promise<CartItem> {
  const res = await apiClient.put<{ data: CartItem }>(`/cart/${variantId}`, {
    quantity,
  });
  return res.data.data;
}

export async function removeCartItem(variantId: string): Promise<void> {
  await apiClient.delete(`/cart/${variantId}`);
}
