"use client";

import { useState, useEffect } from "react";
import {
  X,
  Search,
  Scissors,
  Ruler,
  CheckCircle2,
  Loader2,
  Pencil,
  Package,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderDrawerStore } from "@/lib/stores/useOrderDrawerStore";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order, OrderStatus, PaymentStatus } from "@/types/order.types";

// ---------------------------------------------------------------------------
// Status timeline — mirrors the customer-facing /track-order page so the
// order lifecycle reads the same way across the whole app.
// ---------------------------------------------------------------------------
const TIMELINE: {
  status: OrderStatus;
  icon: typeof Search;
  label: string;
  desc: string;
}[] = [
  {
    status: "PENDING",
    icon: Search,
    label: "Order Received",
    desc: "Order received and under review by the atelier.",
  },
  {
    status: "PROCESSING",
    icon: Scissors,
    label: "In Production",
    desc: "Master tailors are cutting & assembling the piece.",
  },
  {
    status: "SHIPPED",
    icon: Ruler,
    label: "In Transit",
    desc: "Piece has left the atelier and is en route.",
  },
  {
    status: "DELIVERED",
    icon: CheckCircle2,
    label: "Delivered",
    desc: "Order delivered. Wear it with heritage.",
  },
];

const STATUS_ORDER: OrderStatus[] = TIMELINE.map((t) => t.status);

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  FAILED: "bg-red-50 text-[#C23A3A] border border-red-100",
  REFUNDED: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function OrderDrawer() {
  const { isOpen, activeOrder, close } = useOrderDrawerStore();
  const updateStatus = useUpdateOrderStatus();

  // Local snapshot so a status save can reflect immediately without waiting
  // on the list refetch — mirrors ProductDrawer's local-form-state approach.
  const [order, setOrder] = useState<Order | null>(activeOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus>("PENDING");

  useEffect(() => {
    if (isOpen) {
      setOrder(activeOrder);
      setPendingStatus(activeOrder?.orderStatus ?? "PENDING");
      setIsEditing(false);
      updateStatus.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeOrder]);

  if (!order) return null;

  const currentIdx = STATUS_ORDER.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";

  function handleSaveStatus() {
    if (!order) return;
    if (pendingStatus === order.orderStatus) {
      setIsEditing(false);
      return;
    }
    updateStatus.mutate(
      { id: order.id, status: pendingStatus },
      {
        onSuccess: (updated) => {
          setOrder((prev) =>
            prev
              ? { ...prev, orderStatus: updated.orderStatus, updatedAt: updated.updatedAt }
              : prev
          );
          setIsEditing(false);
        },
      }
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
          onClick={updateStatus.isPending ? undefined : close}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#FAF7F2] border-l border-border z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex justify-between items-start px-8 py-6 border-b border-border bg-white flex-shrink-0">
          <div>
            <p className="text-[9px] font-courier tracking-[2px] uppercase text-zinc-500">
              Order Details
            </p>
            <h2 className="text-2xl font-garamound font-bold text-zinc-900 mt-1">
              #{order.orderNumber}
            </h2>
          </div>
          <button
            onClick={close}
            disabled={updateStatus.isPending}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Items — every variant ordered, listed in full */}
          <div>
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500">
                Items Ordered
              </h3>
              <span className="text-[10px] font-courier text-zinc-400">
                {order.items.length} variant{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-white border border-border p-3"
                >
                  <div className="h-16 w-16 bg-zinc-50 border border-border flex items-center justify-center flex-shrink-0">
                    <Package size={22} className="text-zinc-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-garamound text-lg font-bold text-zinc-950 leading-tight truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[10px] font-courier tracking-wide text-zinc-400 mt-1 uppercase">
                      {item.color} · {item.size} · Qty {item.quantity}
                    </p>
                    <p className="text-[#C99A36] font-semibold mt-1">
                      ₦{item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping details */}
          <div>
            <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 border-b border-border pb-2 mb-3">
              Shipping Details
            </h3>
            <div className="text-sm text-zinc-700 space-y-1">
              <p className="font-semibold text-zinc-900">{order.shippingName}</p>
              <p>{order.shippingPhone}</p>
              <p>
                {order.shippingAddress}, {order.shippingCity},{" "}
                {order.shippingState}, {order.shippingCountry}
              </p>
            </div>
          </div>

          {/* Timeline / Edit status */}
          <div>
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500">
                Order Timeline
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[11px] font-courier font-bold tracking-wider text-[#C99A36] hover:text-[#B0852E] uppercase transition-colors"
                >
                  <Pencil size={12} />
                  Edit Status
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="bg-white border border-[#EBE8E2] p-4 space-y-4">
                {updateStatus.error && (
                  <p className="text-xs font-courier text-[#C23A3A]">
                    {updateStatus.error.message}
                  </p>
                )}
                <div>
                  <label className="text-[10px] font-courier font-bold tracking-[2px] uppercase text-zinc-400 block mb-1">
                    Order Status
                  </label>
                  <select
                    value={pendingStatus}
                    onChange={(e) =>
                      setPendingStatus(e.target.value as OrderStatus)
                    }
                    className="w-full px-4 py-2.5 bg-white border border-[#EBE8E2] text-sm text-zinc-900 focus:outline-none focus:border-[#C99A36]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPendingStatus(order.orderStatus);
                    }}
                    disabled={updateStatus.isPending}
                    className="text-xs font-courier font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={updateStatus.isPending}
                    className="bg-[#C99A36] hover:bg-[#B0852E] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    {updateStatus.isPending && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : isCancelled ? (
              <div className="bg-red-50 border border-red-100 text-[#C23A3A] px-4 py-3 text-xs font-courier font-bold uppercase tracking-wider">
                Order Cancelled
              </div>
            ) : (
              <div>
                {TIMELINE.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = i <= currentIdx;
                  const isLast = i === TIMELINE.length - 1;

                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0",
                            isDone
                              ? "border-[#C99A36] bg-[#FBF4E3]"
                              : "border-zinc-200"
                          )}
                        >
                          <Icon
                            size={14}
                            className={isDone ? "text-[#C99A36]" : "text-zinc-300"}
                          />
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              "w-px h-8 flex-shrink-0",
                              isDone ? "bg-[#C99A36]" : "bg-zinc-200"
                            )}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={cn(
                            "text-xs font-courier font-bold uppercase tracking-wider",
                            isDone ? "text-zinc-900" : "text-zinc-400"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 border-b border-border pb-2 mb-3">
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="text-zinc-900">
                  ₦{order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Shipping</span>
                <span className="text-zinc-900">
                  ₦{order.shippingFee.toLocaleString()}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Discount</span>
                  <span className="text-zinc-900">
                    -₦{order.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-zinc-900 border-t border-border pt-2">
                <span>Total</span>
                <span className="text-[#C99A36]">
                  ₦{order.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-courier uppercase tracking-wider text-zinc-400">
                  Payment Status
                </span>
                <span
                  className={cn(
                    "text-[9px] font-courier font-bold uppercase tracking-wider px-2 py-1",
                    PAYMENT_BADGE[order.paymentStatus]
                  )}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-courier uppercase tracking-wider text-zinc-400">
                    Method
                  </span>
                  <span className="text-xs text-zinc-700">
                    {order.payment.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="px-8 py-5 border-t border-border bg-[#FAF7F2] flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3 text-xs font-courier font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={14} />
            Download Invoice
          </button>
        </div>
      </div>
    </>
  );
}
