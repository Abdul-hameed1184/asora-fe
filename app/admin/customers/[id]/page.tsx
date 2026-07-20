"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminCustomer } from "@/hooks/useCustomers";
import { fetchAdminOrderById } from "@/lib/api/orders.api";
import { useOrderDrawerStore } from "@/lib/stores/useOrderDrawerStore";
import OrderDrawer from "@/app/admin/components/OrderDrawer";
import type { CustomerOrderSummary } from "@/types/customer.types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

const ORDER_STATUS_BADGE: Record<CustomerOrderSummary["orderStatus"], string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
  PROCESSING: "bg-[#FAF4EB] text-[#A67C37] border border-[#E9DFCE]",
  SHIPPED: "bg-blue-50 text-blue-700 border border-blue-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED: "bg-red-50 text-[#C23A3A] border border-red-100",
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customerId = params.id;

  const { data: customer, isPending, isFetching, isError, error, refetch } = useAdminCustomer(customerId);
  const { open: openOrderDrawer } = useOrderDrawerStore();

  const isBackgroundRefetch = isFetching && !isPending;

  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  async function handleViewOrder(orderId: string) {
    if (loadingOrderId) return;
    setLoadingOrderId(orderId);
    try {
      const order = await fetchAdminOrderById(orderId);
      openOrderDrawer(order);
    } catch {
      // apiClient's response interceptor already surfaces a toast on failure
    } finally {
      setLoadingOrderId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8]">
      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/customers")}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-garamound font-bold text-zinc-950">
              Customer Details
            </h1>
            <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
              Customer Database & Accounts
            </p>
          </div>
        </div>

        {isBackgroundRefetch && (
          <div className="flex items-center gap-1.5 text-[10px] font-courier tracking-wider text-zinc-400 uppercase">
            <RefreshCw size={11} className="animate-spin" />
            <span>Syncing…</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-10 max-w-5xl mx-auto pb-20">
        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {isPending && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white border border-border shadow-sm p-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-zinc-100 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-border shadow-sm p-8 h-40" />
            <div className="bg-white border border-border shadow-sm p-8 h-40" />
          </div>
        )}

        {/* ── Error state ─────────────────────────────────────────────── */}
        {isError && !isPending && (
          <div className="bg-white border border-border shadow-sm">
            <ErrorState
              title="Could not load this customer"
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {/* ── Customer detail ──────────────────────────────────────────── */}
        {!isPending && !isError && customer && (
          <div className="space-y-6">
            {/* Profile card */}
            <section className="bg-white border border-border shadow-sm p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#FAF4EB] border border-[#E9DFCE] text-[#C99A36] font-semibold flex items-center justify-center text-xl font-sans flex-shrink-0">
                    {`${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-garamound text-2xl font-bold text-zinc-950 leading-tight">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <span
                      className={cn(
                        "inline-block mt-2 rounded-full px-3 py-1 text-[10px] font-courier font-bold uppercase tracking-wider",
                        customer.isVerified
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-[#EAEAEA] text-[#737373]"
                      )}
                    >
                      {customer.isVerified ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                      Orders Placed
                    </p>
                    <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                      {customer.ordersPlaced}
                    </p>
                  </div>
                  <div className="border-l border-border pl-8">
                    <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                      Total Spent
                    </p>
                    <p className="text-xl font-garamound font-bold text-[#C99A36] mt-1">
                      ₦{customer.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm text-zinc-700">
                  <Mail size={16} className="text-zinc-400 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-700">
                  <Phone size={16} className="text-zinc-400 flex-shrink-0" />
                  <span>{customer.phoneNumber || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-700">
                  <Calendar size={16} className="text-zinc-400 flex-shrink-0" />
                  <span>
                    Joined{" "}
                    {new Date(customer.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </section>

            {/* Addresses */}
            <section className="bg-white border border-border shadow-sm p-8">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 border-b border-border pb-3 mb-4">
                Saved Addresses
              </h3>
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-zinc-400">No addresses on file.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {customer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex gap-3 border border-border p-4 bg-[#FAF9F6]"
                    >
                      <MapPin size={16} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-zinc-700">
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.state}, {addr.country}
                        </p>
                        {addr.isDefault && (
                          <span className="inline-block mt-1 text-[9px] font-courier font-bold uppercase tracking-wider text-[#C99A36]">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Order history */}
            <section className="bg-white border border-border shadow-sm overflow-hidden">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 border-b border-border px-8 py-5 bg-[#FAF9F6]">
                Order History
              </h3>
              {customer.orders.length === 0 ? (
                <EmptyState icon={Package} title="This customer has not placed any orders yet." />
              ) : (
                <div className="divide-y divide-border">
                  {customer.orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleViewOrder(order.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        loadingOrderId === order.id
                          ? "opacity-60 pointer-events-none"
                          : "hover:bg-zinc-50/50"
                      )}
                    >
                      {/* Desktop / tablet row */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 px-8 py-5 items-center">
                        <div className="col-span-4 text-sm font-courier font-semibold text-zinc-900">
                          #{order.orderNumber}
                        </div>
                        <div className="col-span-3 text-sm text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="col-span-2 text-sm font-semibold text-zinc-900">
                          ₦{order.totalAmount.toLocaleString()}
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-3">
                          {loadingOrderId === order.id && (
                            <Loader2 size={14} className="animate-spin text-zinc-400" />
                          )}
                          <span
                            className={cn(
                              "inline-block rounded-full px-3 py-1.5 text-[10px] font-courier font-bold uppercase tracking-wider text-center",
                              ORDER_STATUS_BADGE[order.orderStatus]
                            )}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden px-6 py-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-courier font-semibold text-zinc-900">
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            · ₦{order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {loadingOrderId === order.id && (
                            <Loader2 size={14} className="animate-spin text-zinc-400" />
                          )}
                          <span
                            className={cn(
                              "inline-block rounded-full px-3 py-1.5 text-[10px] font-courier font-bold uppercase tracking-wider text-center",
                              ORDER_STATUS_BADGE[order.orderStatus]
                            )}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Drawer — driven by Zustand UI state; data mutations go through TQ */}
      <OrderDrawer />
    </div>
  );
}
