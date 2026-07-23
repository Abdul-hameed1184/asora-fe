"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAdminCustomers } from "@/hooks/useCustomers";
import type { CustomerFilters } from "@/lib/api/customers.api";
import type { Customer, CustomerStatus } from "@/types/customer.types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";

// ---------------------------------------------------------------------------
// Spend tier filter — applied client-side over the fetched page (the admin
// customers endpoint has no spend-range param — see GetAdminCustomersParams
// in types/customer.types.ts).
// ---------------------------------------------------------------------------
type SpentFilter = "" | "UNDER_50K" | "50K_TO_200K" | "OVER_200K";

const SPENT_OPTIONS: { label: string; value: SpentFilter }[] = [
  { label: "Under ₦50,000", value: "UNDER_50K" },
  { label: "₦50,000 – ₦200,000", value: "50K_TO_200K" },
  { label: "Over ₦200,000", value: "OVER_200K" },
];

function matchesSpent(customer: Customer, tier: SpentFilter): boolean {
  if (!tier) return true;
  if (tier === "UNDER_50K") return customer.totalSpent < 50_000;
  if (tier === "50K_TO_200K")
    return customer.totalSpent >= 50_000 && customer.totalSpent <= 200_000;
  return customer.totalSpent > 200_000;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
type StatusFilter = CustomerStatus | "ALL";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All Customers", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

function initialsOf(customer: Customer): string {
  return `${customer.firstName[0] ?? ""}${customer.lastName[0] ?? ""}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [spentFilter, setSpentFilter] = useState<SpentFilter>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const hasActiveFilters = activeTab !== "ALL" || !!searchQuery || !!spentFilter;

  const clearFilters = () => {
    setActiveTab("ALL");
    setSearchQuery("");
    setSpentFilter("");
    setPage(1);
  };

  // ── Build filters from UI state ──────────────────────────────────────────
  const filters: CustomerFilters = {
    page,
    limit,
    status: activeTab !== "ALL" ? activeTab : undefined,
    search: searchQuery || undefined,
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
  } = useAdminCustomers(filters);

  // Lightweight companion query just to surface an "active clients" count
  // in the footer, independent of whatever tab/page/search is currently active.
  const { data: activeData } = useAdminCustomers({ status: "ACTIVE", limit: 1 });

  const customers = data?.data ?? [];
  const filteredCustomers = customers.filter((c) => matchesSpent(c, spentFilter));
  const pagination = data?.pagination;

  // ── Derived UI flags ──────────────────────────────────────────────────────
  const isEmpty = !isPending && !isError && filteredCustomers.length === 0;
  const isBackgroundRefetch = isFetching && !isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fbf9f8]">
      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">Customers</h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Customer Database & Accounts
          </p>
        </div>

        <div className="flex items-center gap-6">
          {isBackgroundRefetch && (
            <div className="flex items-center gap-1.5 text-[10px] font-courier tracking-wider text-zinc-400 uppercase">
              <RefreshCw size={11} className="animate-spin" />
              <span>Syncing…</span>
            </div>
          )}

          <NotificationBell />

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
              placeholder="Search by client name, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
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
                    "px-6 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-all",
                    activeTab === tab.value
                      ? "bg-white text-[#C99A36] shadow-sm border border-[#E9DFCE]"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter by spend tier */}
            <FilterSelect
              value={spentFilter}
              onChange={(v) => setSpentFilter(v as SpentFilter)}
              options={SPENT_OPTIONS}
              placeholder="Filter by Spent"
            />

            {/* Clear filters */}
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

        {/* Customers Table Rows */}
        <section
          className={cn(
            "mt-8 bg-white border border-border shadow-sm overflow-hidden transition-opacity duration-200",
            isPlaceholderData && "opacity-70"
          )}
        >
          {/* Headers (lg and up) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-5">Client Details</div>
            <div className="col-span-2 text-center">Orders Placed</div>
            <div className="col-span-3 text-center">Total Value Spent</div>
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
                      <div className="h-12 w-12 rounded-full bg-zinc-100 flex-shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-zinc-100 rounded w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-16" />
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <div className="h-4 bg-zinc-100 rounded w-24" />
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
                    <div className="h-12 w-12 rounded-full bg-zinc-100 flex-shrink-0" />
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
              title="Could not load customers"
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {isEmpty && (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}" in this tab.`
                  : spentFilter
                    ? "No customers match the selected spend range."
                    : "There are no customers in this tab yet."
              }
            />
          )}

          {/* List items */}
          {!isPending && !isError && filteredCustomers.length > 0 && (
            <div className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => router.push(`/admin/customers/${customer.id}`)}
                  className="hover:bg-zinc-50/50 transition-colors cursor-pointer"
                >
                  {/* Desktop / tablet row */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-6 items-center">
                    {/* Customer Details */}
                    <div className="col-span-5 flex items-center gap-4">
                      {/* Initials Badge */}
                      <div className="h-12 w-12 rounded-full bg-[#FAF4EB] border border-[#E9DFCE] text-[#C99A36] font-semibold flex items-center justify-center text-sm font-sans flex-shrink-0">
                        {initialsOf(customer)}
                      </div>
                      <div>
                        <h4 className="font-garamound text-xl font-bold text-zinc-950 leading-tight">
                          {customer.firstName} {customer.lastName}
                        </h4>
                        <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    {/* Orders Placed */}
                    <div className="col-span-2 text-center text-sm font-sans text-zinc-900 font-medium">
                      {customer.ordersPlaced} Orders
                    </div>

                    {/* Total Value Spent */}
                    <div className="col-span-3 text-center text-md font-semibold text-zinc-900 font-sans">
                      ₦{customer.totalSpent.toLocaleString()}
                    </div>

                    {/* Status & Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-center mr-2",
                          customer.isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-[#EAEAEA] text-[#737373]"
                        )}
                      >
                        {customer.isVerified ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/customers/${customer.id}`);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors"
                        title="View customer"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile / tablet card */}
                  <div className="lg:hidden px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#FAF4EB] border border-[#E9DFCE] text-[#C99A36] font-semibold flex items-center justify-center text-sm font-sans flex-shrink-0">
                        {initialsOf(customer)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-garamound text-lg font-bold text-zinc-950 leading-tight truncate">
                          {customer.firstName} {customer.lastName}
                        </h4>
                        <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1 truncate">
                          {customer.email}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/customers/${customer.id}`);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors flex-shrink-0"
                        title="View customer"
                      >
                        <Eye size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm font-sans text-zinc-900 font-medium">
                        {customer.ordersPlaced} Orders
                      </div>
                      <div className="text-md font-semibold text-zinc-900 font-sans">
                        ₦{customer.totalSpent.toLocaleString()}
                      </div>
                      <span
                        className={cn(
                          "inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider text-center",
                          customer.isVerified
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-[#EAEAEA] text-[#737373]"
                        )}
                      >
                        {customer.isVerified ? "Active" : "Inactive"}
                      </span>
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
                Total Client Count
              </p>
              <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                {pagination?.total ?? "—"} Clients
              </p>
            </div>
            <div className="border-l border-border pl-8">
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Active Clients
              </p>
              <p className="text-xl font-garamound font-bold text-emerald-700 mt-1">
                {activeData?.pagination.total ?? "—"} Clients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-courier tracking-wide text-zinc-400">
              SHOWING {filteredCustomers.length} OF {pagination?.total ?? 0}
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
