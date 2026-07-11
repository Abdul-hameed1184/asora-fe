"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Scissors, Ruler, CheckCircle2, AlertCircle } from "lucide-react";
import { OrderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types/order.types";
import { PaginatedResponse } from "@/types/api.types";

const TIMELINE: { status: OrderStatus; icon: React.ElementType; label: string; desc: string }[] = [
  {
    status: "PENDING",
    icon: Search,
    label: "Order Received",
    desc: "Your order has been received and is being reviewed by our team.",
  },
  {
    status: "PROCESSING",
    icon: Scissors,
    label: "Design Authentication",
    desc: "Our master tailors are reviewing your measurements for structural integrity.",
  },
  {
    status: "SHIPPED",
    icon: Ruler,
    label: "Precision Cutting",
    desc: "Fabric has been carefully cut and prepared for expert assembly.",
  },
  {
    status: "DELIVERED",
    icon: CheckCircle2,
    label: "Order Delivered",
    desc: "Your piece has been delivered. Wear it with heritage.",
  },
];

const STATUS_ORDER: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRetrieve = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your order ID.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setOrder(null);
    try {
      const res = (await OrderService.getOrders()) as PaginatedResponse<Order[]>;
      const found =
        (res.data as Order[]).find(
          (o) => o.orderNumber.toLowerCase() === trimmed.toLowerCase()
        ) ?? null;
      if (!found) {
        setErrorMsg("No order found with that ID. Please check and try again.");
      } else {
        setOrder(found);
      }
    } catch {
      setErrorMsg("Unable to retrieve order. Please sign in and try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIdx = order
    ? STATUS_ORDER.indexOf(order.orderStatus)
    : -1;

  const STATUS_BADGE: Partial<Record<OrderStatus, string>> = {
    PENDING: "bg-warning/10 text-warning border border-warning/20",
    PROCESSING: "bg-primary/10 text-primary border border-primary/20",
    SHIPPED: "bg-blue-50 text-blue-700 border border-blue-200",
    DELIVERED: "bg-success/10 text-success border border-success/20",
    CANCELLED: "bg-alert/10 text-alert border border-alert/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Account
          </p>
          <h1 className="font-garamound text-4xl font-semibold text-foreground">
            Track Your Journey
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — Search form + timeline */}
          <div>
            <div className="border border-border p-8">
              {/* Form */}
              <div className="space-y-8 mb-8">
                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-3">
                    Order Identification
                  </label>
                  <input
                    type="text"
                    placeholder="TX-XXXXX"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value.toUpperCase());
                      setErrorMsg(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleRetrieve()}
                    className="w-full border-b border-border bg-transparent font-courier text-sm tracking-widest pb-2 placeholder:text-foreground/25 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="atelier@toke.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-border bg-transparent font-courier text-sm pb-2 placeholder:text-foreground/25 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 mb-6 p-3 bg-alert/5 border border-alert/20">
                  <AlertCircle className="w-4 h-4 text-alert flex-shrink-0 mt-0.5" />
                  <p className="font-courier text-[9px] text-alert leading-relaxed">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handleRetrieve}
                disabled={loading}
                className="w-full bg-primary text-white font-courier text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Retrieve Status
              </button>

              {/* Timeline */}
              {order && (
                <div className="mt-10 pt-8 border-t border-border">
                  <p className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 mb-6">
                    Current Activity
                  </p>

                  <div>
                    {TIMELINE.slice(0, currentStatusIdx + 2).map((step, i) => {
                      const Icon = step.icon;
                      const isDone = i <= currentStatusIdx;
                      const isLast =
                        i ===
                        Math.min(currentStatusIdx + 1, TIMELINE.length - 1);

                      return (
                        <div key={step.status} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 flex items-center justify-center border flex-shrink-0 ${
                                isDone
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              }`}
                            >
                              <Icon
                                className={`w-3.5 h-3.5 ${
                                  isDone ? "text-primary" : "text-foreground/20"
                                }`}
                              />
                            </div>
                            {!isLast && (
                              <div className="w-px h-8 bg-border flex-shrink-0" />
                            )}
                          </div>
                          <div className="pb-6">
                            <p
                              className={`font-courier text-[10px] tracking-[0.1em] uppercase mb-1 ${
                                isDone ? "text-foreground" : "text-foreground/30"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-foreground/50 text-xs leading-relaxed">
                              {step.desc}
                            </p>
                            <p className="font-courier text-[8px] text-foreground/25 mt-1.5">
                              {isDone
                                ? new Date(order.updatedAt).toLocaleDateString(
                                    "en-NG",
                                    { day: "numeric", month: "short", year: "numeric" }
                                  )
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Photo + order summary */}
          <div className="space-y-6">
            {/* Atmospheric image */}
            <div className="relative h-72 overflow-hidden">
              <Image
                src="/hero.png"
                alt="Atelier craftsmanship"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/45 flex items-end p-8">
                <blockquote className="font-garamound text-white text-xl italic leading-relaxed">
                  &ldquo;Crafting a legacy requires time, patience, and the
                  finest thread.&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Order detail card */}
            {order ? (
              <div className="border border-primary/30 p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-garamound text-xl font-semibold text-foreground">
                    Order Summary
                  </h3>
                  <span
                    className={`font-courier text-[8px] tracking-[0.15em] uppercase px-2.5 py-1 flex-shrink-0 ${
                      STATUS_BADGE[order.orderStatus] ??
                      "bg-border/20 text-foreground/50 border border-border"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <p className="font-courier text-[9px] tracking-[0.15em] uppercase text-primary mb-5">
                  {order.orderNumber}
                </p>

                <div className="space-y-4 border-b border-border pb-5 mb-5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.productName}
                        </p>
                        <p className="font-courier text-[9px] uppercase text-foreground/40 mt-0.5">
                          {item.color} / {item.size} ×{item.quantity}
                        </p>
                      </div>
                      <span className="text-foreground/60 flex-shrink-0">
                        ₦{item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="font-courier text-[10px] uppercase text-foreground/40 tracking-wider">
                    Total Investment
                  </span>
                  <span className="text-primary font-bold text-lg">
                    ₦{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-border p-8 text-center">
                <p className="font-garamound text-xl text-foreground/25 mb-2">
                  No order loaded
                </p>
                <p className="font-courier text-[9px] text-foreground/20">
                  Enter your order ID to retrieve its status
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
