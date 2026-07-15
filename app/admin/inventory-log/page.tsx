"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
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
} from "@/lib/api/inventory-log.api";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function InventoryLogPage() {
  const [activeTab, setActiveTab] = useState<InventoryMovementType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const user = useAuthStore((s) => s.user);

  // ── Build filters from UI state ──────────────────────────────────────────
  const filters: InventoryLogFilters = {
    page,
    limit: 15,
    search: searchQuery || undefined,
    type: activeTab === "ALL" ? undefined : activeTab,
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

            <button className="flex items-center gap-3 bg-white border border-border px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider text-zinc-600 hover:border-zinc-400 transition-colors">
              <span>Filter by reason</span>
              <ChevronDown size={14} />
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
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-4">Variant</div>
            <div className="col-span-2 text-center">Type / Reason</div>
            <div className="col-span-2 text-center">Stock Change</div>
            <div className="col-span-2 text-center">Reference</div>
            <div className="col-span-2 text-right">Date</div>
          </div>

          {/* ── Loading skeleton — first fetch only ─────────────────────── */}
          {isPending && (
            <div className="divide-y divide-border">
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
          )}

          {/* ── Error state ─────────────────────────────────────────────── */}
          {isError && !isPending && (
            <div className="py-20 flex flex-col items-center gap-4 text-center px-8">
              <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertCircle size={22} className="text-[#C23A3A]" />
              </div>
              <div>
                <p className="font-garamound text-lg font-bold text-zinc-900">
                  Could not load inventory logs
                </p>
                <p className="text-xs font-courier text-zinc-400 mt-1 max-w-sm">
                  {(error as Error)?.message ?? "An unexpected error occurred. Please try again."}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs font-courier font-bold uppercase tracking-wider text-[#C99A36] hover:text-[#B0852E] border border-[#C99A36]/40 hover:border-[#C99A36] px-4 py-2 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {isEmpty && (
            <div className="py-20 flex flex-col items-center gap-4 text-center px-8">
              <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <History size={22} className="text-zinc-300" />
              </div>
              <div>
                <p className="font-garamound text-lg font-bold text-zinc-900">
                  No inventory movements found
                </p>
                <p className="text-xs font-courier text-zinc-400 mt-1">
                  {searchQuery
                    ? `No results for "${searchQuery}".`
                    : "Stock movements will appear here as they happen."}
                </p>
              </div>
            </div>
          )}

          {/* ── Log rows ─────────────────────────────────────────────────── */}
          {!isPending && !isError && logs.length > 0 && (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-zinc-50/50 transition-colors"
                >
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
