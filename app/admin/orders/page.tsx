"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PackageOpen,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import OrderDrawer from "@/app/admin/components/OrderDrawer";
import { useOrderDrawerStore } from "@/lib/stores/useOrderDrawerStore";
import { useAdminOrders } from "@/hooks/useOrders";
import type { OrderFilters } from "@/lib/api/orders.api";
import type { Order, OrderStatus } from "@/types/order.types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
type StatusFilter = OrderStatus | "ALL";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
  PROCESSING: "bg-[#FAF4EB] text-[#A67C37] border border-[#E9DFCE]",
  SHIPPED: "bg-blue-50 text-blue-700 border border-blue-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED: "bg-red-50 text-[#C23A3A] border border-red-100",
};

function matchesSearch(order: Order, query: string): boolean {
  const q = query.toLowerCase();
  return (
    order.orderNumber.toLowerCase().includes(q) ||
    order.shippingName.toLowerCase().includes(q) ||
    `${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`
      .toLowerCase()
      .includes(q) ||
    order.items.some((i) => i.productName.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// Date range filter — applied client-side over the fetched page, mirroring
// the existing search behaviour (the admin orders endpoint has no date
// filter param — see GetAdminOrdersParams in types/order.types.ts).
// ---------------------------------------------------------------------------
type DateRangeFilter = "" | "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS";

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeFilter }[] = [
  { label: "Today", value: "TODAY" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
];

const DATE_RANGE_DAYS: Record<Exclude<DateRangeFilter, "">, number> = {
  TODAY: 1,
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
};

function matchesDateRange(order: Order, range: DateRangeFilter): boolean {
  if (!range) return true;
  const cutoff = Date.now() - DATE_RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
  return new Date(order.createdAt).getTime() >= cutoff;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { open: openOrderDrawer } = useOrderDrawerStore();

  const hasActiveFilters = activeTab !== "ALL" || !!searchQuery || !!dateRange;

  const clearFilters = () => {
    setActiveTab("ALL");
    setSearchQuery("");
    setDateRange("");
    setPage(1);
  };

  // ── Build filters from UI state ──────────────────────────────────────────
  const filters: OrderFilters = {
    page,
    limit,
    status: activeTab !== "ALL" ? activeTab : undefined,
  };

  // ── Server state via TanStack Query ─────────────────────────────────────
  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useAdminOrders(filters);

  // Lightweight companion query just to surface a "pending delivery" count
  // in the footer, independent of whatever tab/page is currently active.
  const { data: pendingData } = useAdminOrders({ status: "PENDING", limit: 1 });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const filteredOrders = orders.filter(
    (o) =>
      (!searchQuery || matchesSearch(o, searchQuery)) &&
      matchesDateRange(o, dateRange)
  );

  // ── Derived UI flags ──────────────────────────────────────────────────────
  const isEmpty = !isPending && !isError && filteredOrders.length === 0;
  const isBackgroundRefetch = isFetching && !isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fbf9f8] relative">
      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">Orders</h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Order Tracking & Management
          </p>
        </div>

        <div className="flex items-center gap-6">
          {isBackgroundRefetch && (
            <div className="flex items-center gap-1.5 text-[10px] font-courier tracking-wider text-zinc-400 uppercase">
              <RefreshCw size={11} className="animate-spin" />
              <span>Syncing…</span>
            </div>
          )}

          <button className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-700">
            <Bell size={22} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C99A36] rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900">Olumide Ade</p>
              <p className="text-[10px] font-courier uppercase tracking-wider text-zinc-400">
                Store Manager
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border border-[#C79A35] p-0.5 overflow-hidden">
              <img
                src="/profile.jpg"
                alt="Olumide Ade"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-10 max-w-7xl mx-auto pb-20">
        {/* Actions Bar */}
        <section className="flex flex-col md:flex-row justify-between gap-6 items-center">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by order reference, client, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-border text-sm text-zinc-900 rounded-none focus:outline-none focus:border-[#C99A36] placeholder-zinc-400"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Tabs */}
            <div className="bg-zinc-100 border border-zinc-200/80 p-1 flex rounded-none">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-all",
                    activeTab === tab.value
                      ? "bg-white text-[#C99A36] shadow-sm border border-[#E9DFCE]"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <FilterSelect
              value={dateRange}
              onChange={(v) => {
                setDateRange(v as DateRangeFilter);
                setPage(1);
              }}
              options={DATE_RANGE_OPTIONS}
              placeholder="Filter by Date"
            />

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              title="Clear filters"
              className="p-3 bg-white border border-border text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </section>

        {/* Orders Table */}
        <section
          className={cn(
            "mt-8 bg-white border border-border shadow-sm overflow-hidden transition-opacity duration-200",
            isPlaceholderData && "opacity-70"
          )}
        >
          {/* Headers (lg and up) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-5">Order Details</div>
            <div className="col-span-2 text-center">Reference</div>
            <div className="col-span-2 text-center">Date Placed</div>
            <div className="col-span-1 text-center">Value</div>
            <div className="col-span-2 text-right">Status & Action</div>
          </div>

          {/* ── Loading skeleton — first fetch only ─────────────────────── */}
          {isPending && (
            <>
              {/* Desktop / tablet skeleton */}
              <div className="hidden lg:block divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 px-8 py-6 items-center animate-pulse"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="h-16 w-16 bg-zinc-100 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-zinc-100 rounded w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-20" />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-20" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-16" />
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <div className="h-7 bg-zinc-100 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile skeleton */}
              <div className="lg:hidden divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-6 py-5 flex items-center gap-4 animate-pulse">
                    <div className="h-14 w-14 bg-zinc-100 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-zinc-100 rounded w-3/4" />
                      <div className="h-3 bg-zinc-100 rounded w-1/2" />
                      <div className="h-3 bg-zinc-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Error state ─────────────────────────────────────────────── */}
          {isError && !isPending && (
            <ErrorState
              title="Could not load orders"
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {isEmpty && (
            <EmptyState
              icon={PackageOpen}
              title="No orders found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}" in this tab.`
                  : hasActiveFilters
                    ? "No orders match the current filters."
                    : "There are no orders in this tab yet."
              }
            />
          )}

          {/* ── Order rows ──────────────────────────────────────────────── */}
          {!isPending && !isError && filteredOrders.length > 0 && (
            <div className="divide-y divide-border">
              {filteredOrders.map((order) => {
                const firstItem = order.items[0];
                const customerName =
                  order.shippingName ||
                  `${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`.trim();

                return (
                  <div
                    key={order.id}
                    onClick={() => openOrderDrawer(order)}
                    className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  >
                    {/* Desktop / tablet row */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-6 items-center">
                      {/* Order Details */}
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="h-16 w-16 bg-zinc-50 border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                          <Package size={22} className="text-zinc-300" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-garamound text-xl font-bold text-zinc-950 leading-tight truncate">
                            {firstItem
                              ? `${firstItem.productName}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
                              : "—"}
                          </h4>
                          <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1 truncate">
                            Client: {customerName || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Reference */}
                      <div className="col-span-2 text-center text-sm font-courier text-zinc-900 font-semibold">
                        <p>#{order.orderNumber}</p>
                        {firstItem?.sku && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">{firstItem.sku}</p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-center text-sm text-zinc-500 font-sans">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Value */}
                      <div className="col-span-1 text-center text-md font-semibold text-zinc-900">
                        ₦{order.totalAmount.toLocaleString()}
                      </div>

                      {/* Status & Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1.5 text-[10px] font-courier font-bold uppercase tracking-wider text-center",
                            STATUS_BADGE[order.orderStatus]
                          )}
                        >
                          {order.orderStatus}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDrawer(order);
                          }}
                          className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors"
                          title="View order"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile / tablet card */}
                    <div className="lg:hidden px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-zinc-50 border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-zinc-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-garamound text-lg font-bold text-zinc-950 leading-tight truncate">
                            {firstItem
                              ? `${firstItem.productName}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}`
                              : "—"}
                          </h4>
                          <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1 truncate">
                            #{order.orderNumber} · Client: {customerName || "—"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDrawer(order);
                          }}
                          className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors flex-shrink-0"
                          title="View order"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-xs font-courier text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-md font-semibold text-zinc-900">
                          ₦{order.totalAmount.toLocaleString()}
                        </div>
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1.5 text-[10px] font-courier font-bold uppercase tracking-wider text-center",
                            STATUS_BADGE[order.orderStatus]
                          )}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Bar */}
        <section className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-[#FAF9F6] border border-border px-8 py-5 gap-4">
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Total Order Count
              </p>
              <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                {pagination?.total ?? "—"} Orders
              </p>
            </div>
            <div className="border-l border-border pl-8">
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Pending Delivery
              </p>
              <p className="text-xl font-garamound font-bold text-[#A67C37] mt-1">
                {pendingData?.pagination.total ?? "—"} Orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-courier tracking-wide text-zinc-400">
              SHOWING {filteredOrders.length} OF {pagination?.total ?? 0}
            </span>
            <PageSizeSelect
              value={limit}
              onChange={(v) => {
                setLimit(v);
                setPage(1);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination?.hasPrevPage || isFetching}
                className="p-2 bg-white border border-border text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination?.hasNextPage || isFetching}
                className="p-2 bg-white border border-border text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Drawer — driven by Zustand UI state; data mutations go through TQ */}
      <OrderDrawer />
    </div>
  );
}
