"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, Loader2, RotateCcw, PackageX } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { OrderService } from "@/services/order.service";
import { QUERY_KEYS } from "@/hooks/queryKeys";
import { Order, OrderStatus } from "@/types/order.types";
import { ApiSuccess } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import { openInvoicePrintView } from "@/lib/invoice";

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

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data, isPending, isError, error, refetch } = useApiQuery<ApiSuccess<Order>>({
    queryKey: QUERY_KEYS.order(id),
    queryFn: () => OrderService.getById(id),
    enabled: !!id,
    retry: (failureCount, err) => {
      if (err instanceof ApiError && (err as ApiError).statusCode === 404) return false;
      return failureCount < 2;
    },
  });

  const order = data?.data;
  const notFound = isError && (error as ApiError)?.statusCode === 404;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-1.5 font-courier text-[10px] tracking-[0.15em] uppercase text-foreground/50 hover:text-foreground transition-colors mb-10"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Orders
        </button>

        {isPending ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40">
              Loading order…
            </p>
          </div>
        ) : notFound ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center">
              <PackageX className="w-9 h-9 text-foreground/20" />
            </div>
            <div>
              <h2 className="font-garamound text-2xl text-foreground mb-2">Order not found</h2>
              <p className="text-foreground/50 text-sm">
                This order doesn&apos;t exist or doesn&apos;t belong to your account.
              </p>
            </div>
            <Link
              href="/orders"
              className="bg-primary text-white font-courier text-[10px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        ) : isError || !order ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <p className="font-garamound text-xl text-foreground/50">Failed to load this order</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 font-courier text-[10px] tracking-[0.2em] uppercase text-primary hover:text-primary/70 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-10 border-b border-border pb-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h1 className="font-garamound text-3xl font-semibold text-foreground">
                  Order {order.orderNumber}
                </h1>
                <span
                  className={`font-courier text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 ${
                    STATUS_BADGE[order.orderStatus] ?? "bg-border/20 text-foreground/50 border border-border"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
              <p className="font-courier text-[10px] text-foreground/40 tracking-wide">
                Placed {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Items */}
              <div className="lg:col-span-3">
                <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-5">
                  Items
                </p>
                <div className="space-y-5 divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 pt-5 first:pt-0">
                      <div className="min-w-0">
                        <p className="font-garamound text-base font-semibold text-foreground truncate">
                          {item.productName}
                        </p>
                        <p className="font-courier text-[9px] tracking-[0.15em] uppercase text-foreground/40 mt-1">
                          {item.color} / {item.size} × {item.quantity}
                        </p>
                        <p className="font-courier text-[9px] text-foreground/30 mt-1">
                          ₦{item.unitPrice.toLocaleString()} each
                        </p>
                      </div>
                      <span className="text-foreground font-semibold flex-shrink-0">
                        ₦{item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
                    Shipping Address
                  </p>
                  <p className="font-courier text-sm text-foreground leading-relaxed">
                    {order.shippingName}
                    <br />
                    {order.shippingAddress}
                    <br />
                    {order.shippingCity}, {order.shippingState}, {order.shippingCountry}
                    <br />
                    {order.shippingPhone}
                  </p>
                </div>
              </div>

              {/* Totals + invoice */}
              <div className="lg:col-span-2">
                <div className="border border-border p-7 sticky top-24">
                  <p className="font-courier text-[10px] tracking-[0.25em] uppercase text-foreground/40 mb-6">
                    Summary
                  </p>

                  <div className="space-y-3 pb-5 border-b border-border text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Subtotal</span>
                      <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Shipping</span>
                      <span className="font-medium">₦{order.shippingFee.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-₦{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-baseline py-5">
                    <span className="font-garamound text-base font-semibold">Total</span>
                    <span className="text-primary font-bold text-xl">
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => openInvoicePrintView(order)}
                    className="w-full flex items-center justify-center gap-2 border border-border text-foreground/70 font-courier text-[10px] tracking-[0.2em] uppercase py-4 hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
