"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useInventoryLogs } from "@/hooks/useInventoryLogs";
import type {
  InventoryLogFilters,
  InventoryMovementType,
  InventoryReason,
} from "@/lib/api/inventory-log.api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";

const REASON_OPTIONS: { label: string; value: InventoryReason }[] = [
  { label: "Initial Stock", value: "INITIAL_STOCK" },
  { label: "Purchase Order", value: "PURCHASE_ORDER" },
  { label: "Stock Return", value: "STOCK_RETURN" },
  { label: "Damaged Item", value: "DAMAGED_ITEM" },
  { label: "Sales Order", value: "SALES_ORDER" },
  { label: "Refund", value: "REFUND" },
  { label: "Inventory Adjustment", value: "INVENTORY_ADJUSTMENT" },
  { label: "Manual Correction", value: "MANUAL_CORRECTION" },
  { label: "Recount", value: "RECOUNT" },
  { label: "Transfer", value: "TRANSFER" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function InventoryLogPage() {
  const [activeTab, setActiveTab] = useState<InventoryMovementType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reasonFilter, setReasonFilter] = useState<InventoryReason | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const user = useAuthStore((s) => s.user);

  const hasActiveFilters = !!searchQuery || !!reasonFilter;

  const clearFilters = () => {
    setSearchQuery("");
    setReasonFilter("");
    setPage(1);
  };

  // ── Build filters from UI state ──────────────────────────────────────────
  const filters: InventoryLogFilters = {
    page,
    limit,
    search: searchQuery || undefined,
    type: activeTab === "ALL" ? undefined : activeTab,
    reason: reasonFilter || undefined,
    sortOrder: "desc",
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
  } = useInventoryLogs(filters);

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Derived UI flags ──────────────────────────────────────────────────────
  const isEmpty = !isPending && !isError && logs.length === 0;
  const isBackgroundRefetch = isFetching && !isPending;

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Admin";
  const displayRole = user?.role === "ADMIN" ? "Store Manager" : user?.role ?? "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fbf9f8] relative">

      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">
            Inventory Log
          </h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Stock Movement History
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Background-refetch indicator */}
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
              <p className="text-sm font-semibold text-zinc-900">{displayName}</p>
              <p className="text-[10px] font-courier uppercase tracking-wider text-zinc-400">
                {displayRole}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border border-[#C79A35] p-0.5 overflow-hidden">
              <img
                src="/profile.jpg"
                alt={displayName}
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
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by SKU or product name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // reset to page 1 on new search
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-border text-sm text-zinc-900 rounded-none focus:outline-none focus:border-[#C99A36] placeholder-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Movement Type Tabs */}
            <div className="bg-zinc-100 border border-zinc-200/80 p-1 flex rounded-none">
              {(["ALL", "IN", "OUT"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={cn(
                    "px-6 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-all",
                    activeTab === tab
                      ? "bg-white text-[#C99A36] shadow-sm border border-[#E9DFCE]"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  {tab === "ALL" ? "All" : tab === "IN" ? "Stock In" : "Stock Out"}
                </button>
              ))}
            </div>

            <FilterSelect
              value={reasonFilter}
              onChange={(v) => {
                setReasonFilter(v as InventoryReason | "");
                setPage(1);
              }}
              options={REASON_OPTIONS}
              placeholder="Filter by reason"
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

        {/* Inventory Log Table */}
        <section
          className={cn(
            "mt-8 bg-white border border-border shadow-sm overflow-hidden transition-opacity duration-200",
            isPlaceholderData && "opacity-70"
          )}
        >
          {/* Column Headers (lg and up) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-4">Variant</div>
            <div className="col-span-2 text-center">Type / Reason</div>
            <div className="col-span-2 text-center">Stock Change</div>
            <div className="col-span-2 text-center">Reference</div>
            <div className="col-span-2 text-right">Date</div>
          </div>

          {/* ── Loading skeleton — first fetch only ─────────────────────── */}
          {isPending && (
            <>
              {/* Desktop / tablet skeleton */}
              <div className="hidden lg:block divide-y divide-border">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 px-8 py-6 items-center animate-pulse"
                  >
                    <div className="col-span-4 space-y-2">
                      <div className="h-4 bg-zinc-100 rounded w-3/4" />
                      <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-20" />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-16" />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-16" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <div className="h-4 bg-zinc-100 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile skeleton */}
              <div className="lg:hidden divide-y divide-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-6 py-5 space-y-2 animate-pulse">
                    <div className="h-4 bg-zinc-100 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    <div className="h-3 bg-zinc-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Error state ─────────────────────────────────────────────── */}
          {isError && !isPending && (
            <ErrorState
              title="Could not load inventory logs"
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {isEmpty && (
            <EmptyState
              icon={History}
              title="No inventory movements found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}".`
                  : hasActiveFilters
                    ? "No inventory movements match the current filters."
                    : "Stock movements will appear here as they happen."
              }
            />
          )}

          {/* ── Log rows ─────────────────────────────────────────────────── */}
          {!isPending && !isError && logs.length > 0 && (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  {/* Desktop / tablet row */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-6 items-center">
                    {/* Variant */}
                    <div className="col-span-4 min-w-0">
                      <h4 className="font-garamound text-lg font-bold text-zinc-950 leading-tight truncate">
                        {log.variant?.product?.name ?? "Unknown product"}
                      </h4>
                      <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1 truncate">
                        {log.variant?.sku} · {log.variant?.color} / {log.variant?.size}
                      </p>
                    </div>

                    {/* Type / Reason */}
                    <div className="col-span-2 flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-courier font-bold uppercase tracking-wider",
                          log.type === "IN" ? "text-emerald-600" : "text-[#C23A3A]"
                        )}
                      >
                        {log.type === "IN" ? (
                          <ArrowUpCircle size={14} />
                        ) : (
                          <ArrowDownCircle size={14} />
                        )}
                        {log.type}
                      </span>
                      <span className="text-[10px] font-courier text-zinc-400 uppercase tracking-wide">
                        {log.reason.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Stock Change */}
                    <div className="col-span-2 text-center">
                      <p className="text-sm font-semibold text-zinc-900">
                        {log.previousStock} → {log.newStock}
                      </p>
                      <p className="text-[10px] font-courier text-zinc-400 uppercase tracking-wide">
                        Qty {log.quantity}
                      </p>
                    </div>

                    {/* Reference */}
                    <div className="col-span-2 text-center text-xs font-courier text-zinc-500">
                      {log.referenceType ? (
                        <>
                          <p className="uppercase">{log.referenceType}</p>
                          {log.referenceId && (
                            <p className="text-zinc-400 truncate" title={log.referenceId}>
                              {log.referenceId.slice(0, 8)}…
                            </p>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-right text-xs font-courier text-zinc-500">
                      {new Date(log.createdAt).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      {new Date(log.createdAt).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Mobile / tablet card */}
                  <div className="lg:hidden px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="font-garamound text-lg font-bold text-zinc-950 leading-tight truncate">
                          {log.variant?.product?.name ?? "Unknown product"}
                        </h4>
                        <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1 truncate">
                          {log.variant?.sku} · {log.variant?.color} / {log.variant?.size}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-courier font-bold uppercase tracking-wider flex-shrink-0",
                          log.type === "IN" ? "text-emerald-600" : "text-[#C23A3A]"
                        )}
                      >
                        {log.type === "IN" ? (
                          <ArrowUpCircle size={14} />
                        ) : (
                          <ArrowDownCircle size={14} />
                        )}
                        {log.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <p className="text-[10px] font-courier font-bold uppercase tracking-wider text-zinc-400">
                          Reason
                        </p>
                        <p className="text-xs font-courier text-zinc-600 uppercase tracking-wide mt-0.5">
                          {log.reason.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-courier font-bold uppercase tracking-wider text-zinc-400">
                          Stock Change
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                          {log.previousStock} → {log.newStock}{" "}
                          <span className="text-[10px] font-courier text-zinc-400 uppercase tracking-wide">
                            (Qty {log.quantity})
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-courier font-bold uppercase tracking-wider text-zinc-400">
                          Reference
                        </p>
                        <p className="text-xs font-courier text-zinc-500 mt-0.5">
                          {log.referenceType ? (
                            <>
                              {log.referenceType}
                              {log.referenceId && ` · ${log.referenceId.slice(0, 8)}…`}
                            </>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-courier font-bold uppercase tracking-wider text-zinc-400">
                          Date
                        </p>
                        <p className="text-xs font-courier text-zinc-500 mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString("en-NG", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          {new Date(log.createdAt).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer Bar */}
        <section className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-[#FAF9F6] border border-border px-8 py-5 gap-4">
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Total Movements
              </p>
              <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                {pagination?.total ?? "—"} Logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-courier tracking-wide text-zinc-400">
              SHOWING {logs.length} OF {pagination?.total ?? 0}
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
    </div>
  );
}
