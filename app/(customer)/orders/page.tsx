"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { OrderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types/order.types";
import { PaginatedResponse } from "@/types/api.types";

type StatusFilter = OrderStatus | "ALL";

const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-warning/10 text-warning border border-warning/20",
  PROCESSING: "bg-primary/10 text-primary border border-primary/20",
  SHIPPED: "bg-blue-50 text-blue-700 border border-blue-200",
  DELIVERED: "bg-success/10 text-success border border-success/20",
  CANCELLED: "bg-alert/10 text-alert border border-alert/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: Order }) {
  const badge = STATUS_BADGE[order.orderStatus] ?? "bg-border/20 text-foreground/50 border border-border";

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="border border-border p-6 sm:p-8 hover:border-primary/40 transition-colors group cursor-pointer">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <p className="font-courier text-xs tracking-[0.15em] uppercase font-semibold text-foreground">
                {order.orderNumber}
              </p>
              <span
                className={`font-courier text-[8px] tracking-[0.15em] uppercase px-2.5 py-1 ${badge}`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="font-courier text-[9px] text-foreground/40 tracking-wide mb-3">
              Placed {formatDate(order.createdAt)}
            </p>
            <p className="text-foreground/55 text-sm line-clamp-1">
              {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(" · ")}
            </p>
          </div>

          <div className="flex items-start gap-5 flex-shrink-0">
            <div className="text-right">
              <p className="font-courier text-[9px] tracking-[0.15em] uppercase text-foreground/40 mb-1">
                Total
              </p>
              <p className="text-primary font-semibold text-lg">
                ₦{order.totalAmount.toLocaleString()}
              </p>
              <p className="font-courier text-[8px] text-foreground/30 mt-1">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

  const { data, isPending, isError, refetch } = useApiQuery<
    PaginatedResponse<Order[]>
  >({
    queryKey: ["orders", activeFilter],
    queryFn: () =>
      OrderService.getOrders(
        activeFilter !== "ALL" ? { status: activeFilter } : undefined
      ) as Promise<PaginatedResponse<Order[]>>,
  });

  const orders: Order[] = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-border pb-8">
          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Account
          </p>
          <h1 className="font-garamound text-4xl font-semibold text-foreground">
            Your Orders
          </h1>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`font-courier text-[9px] tracking-[0.2em] uppercase px-4 py-2 border transition-colors ${
                activeFilter === tab.value
                  ? "bg-primary text-white border-primary"
                  : "border-border text-foreground/50 hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* States */}
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40">
              Loading orders…
            </p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <p className="font-garamound text-xl text-foreground/50">
              Failed to load your orders
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 font-courier text-[10px] tracking-[0.2em] uppercase text-primary hover:text-primary/70 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
            <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center">
              <Package className="w-9 h-9 text-foreground/20" />
            </div>
            <div>
              <h2 className="font-garamound text-2xl text-foreground mb-2">
                No orders yet
              </h2>
              <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
                Your order history will appear here once you&apos;ve placed your
                first order.
              </p>
            </div>
            <Link
              href="/shop"
              className="bg-primary text-white font-courier text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
