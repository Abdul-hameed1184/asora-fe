import { GetAdminOrdersParams } from "@/types/order.types";

export const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCT: "product",
  ORDERS: "orders",
  USERS: "users",
  AUTHENTICATION: "auth",
  NOTIFICATIONS: "notifications",
  CATEGORY: "categories",
  CART: "cart",
  WISHLIST: "wishlist",
  SETTINGS: "settings",
  ANALYTICS: "analytics",
  PAYMENT: "payment",

  orders: ["orders"] as const,

  adminOrders: (params?: GetAdminOrdersParams) =>
    ["admin-orders", params] as const,

  order: (id: string) =>
    ["order", id] as const,

  profile: ["profile"] as const,

  addresses: ["addresses"] as const,

  wishlist: ["wishlist"] as const,

};