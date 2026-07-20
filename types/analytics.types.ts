// types/analytics.types.ts

import type { OrderStatus, PaymentStatus } from "./order.types";

export interface DashboardOverview {
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  paidOrdersCount: number;
}

export interface DashboardRecentOrderUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  user: DashboardRecentOrderUser;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  soldCount: number;
  featuredImage: string | null;
}

export interface DashboardMonthlySales {
  /** "YYYY-MM" */
  month: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface DashboardAnalytics {
  overview: DashboardOverview;
  /** Keyed by order status (backend may return any string key) */
  ordersByStatus: Record<string, number>;
  recentOrders: DashboardRecentOrder[];
  topProducts: DashboardTopProduct[];
  monthlySales: DashboardMonthlySales[];
}
