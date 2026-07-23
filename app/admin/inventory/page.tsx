"use client";

import { useState } from "react";
import {
  Search,
  RotateCcw,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import ProductDrawer, { VARIANT_SIZES } from "@/app/admin/components/ProductDrawer";
import { useProductDrawerStore } from "@/lib/stores/useProductDrawerStore";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useProducts";
import type { ProductFilters } from "@/lib/api/products.api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";

const SIZE_OPTIONS = VARIANT_SIZES.map((size) => ({ label: size, value: size }));

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { openNew, openManageStock } = useProductDrawerStore();

  const hasActiveFilters = !!searchQuery || !!sizeFilter;

  const clearFilters = () => {
    setSearchQuery("");
    setSizeFilter("");
    setPage(1);
  };

  // ── Build filters from UI state ──────────────────────────────────────────
  const filters: ProductFilters = {
    page,
    limit,
    search: searchQuery || undefined,
    status: activeTab,
    size: sizeFilter || undefined,
    sortBy: "createdAt",
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
  } = useAdminProducts(filters);

  // ── Delete — optimistic cache update handled inside useDeleteProduct ─────
  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  // ── Derived UI flags ──────────────────────────────────────────────────────
  const isEmpty = !isPending && !isError && products.length === 0;
  const isBackgroundRefetch = isFetching && !isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fbf9f8] relative">

      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">
            Inventory
          </h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Warehouse Management System
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
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search product name or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // reset to page 1 on new search
              }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-border text-sm text-zinc-900 rounded-none focus:outline-none focus:border-[#C99A36] placeholder-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Status Tabs */}
            <div className="bg-zinc-100 border border-zinc-200/80 p-1 flex rounded-none">
              {(["PUBLISHED", "DRAFT"] as const).map((tab) => (
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
                  {tab === "PUBLISHED" ? "Published" : "Drafts"}
                </button>
              ))}
            </div>

            <FilterSelect
              value={sizeFilter}
              onChange={(v) => {
                setSizeFilter(v);
                setPage(1);
              }}
              options={SIZE_OPTIONS}
              placeholder="Filter by size"
            />

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              title="Clear filters"
              className="p-3 bg-white border border-border text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={openNew}
              className="bg-[#C99A36] hover:bg-[#B0852E] text-white flex items-center gap-2 px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </section>

        {/* Product Table */}
        <section
          className={cn(
            "mt-8 bg-white border border-border shadow-sm overflow-hidden transition-opacity duration-200",
            // Dim the table (not hide) while stale data is shown during a new fetch
            isPlaceholderData && "opacity-70"
          )}
        >
          {/* Column Headers (lg and up) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-5">Product Details</div>
            <div className="col-span-2 text-center">Category</div>
            <div className="col-span-3 text-center">Stock by Size</div>
            <div className="col-span-2 text-right">Actions</div>
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
                    <div className="col-span-3 flex justify-center gap-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-12 w-11 bg-zinc-100" />
                      ))}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <div className="h-7 bg-zinc-100 rounded w-16" />
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
              title="Could not load products"
              message={(error as Error)?.message}
              onRetry={() => refetch()}
            />
          )}

          {/* ── Empty state ─────────────────────────────────────────────── */}
          {isEmpty && (
            <EmptyState
              icon={PackageOpen}
              title="No products found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}" in ${activeTab.toLowerCase()} products.`
                  : sizeFilter
                    ? `No ${activeTab.toLowerCase()} products in size ${sizeFilter}.`
                    : `You have no ${activeTab.toLowerCase()} products yet.`
              }
              actionLabel={!hasActiveFilters ? "Add First Product" : undefined}
              actionIcon={!hasActiveFilters ? Plus : undefined}
              onAction={!hasActiveFilters ? openNew : undefined}
            />
          )}

          {/* ── Product rows ────────────────────────────────────────────── */}
          {!isPending && !isError && products.length > 0 && (
            <div className="divide-y divide-border">
              {products.map((product) => (
                <div key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                  {/* Desktop / tablet row */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-6 items-center">
                    {/* Product Details */}
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="h-16 w-16 bg-zinc-50 border border-border overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-garamound text-xl font-bold text-zinc-950 leading-tight truncate">
                            {product.name}
                          </h4>
                          {product.isFeatured && (
                            <span className="text-[9px] font-courier font-bold uppercase tracking-wider bg-[#FBF4E3] text-[#C99A36] px-1.5 py-0.5 flex-shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1 truncate">
                          ₦{product.basePrice.toLocaleString()} base ·{" "}
                          <span
                            className={cn(
                              "uppercase",
                              product.status === "PUBLISHED"
                                ? "text-emerald-600"
                                : product.status === "ARCHIVED"
                                  ? "text-zinc-400"
                                  : "text-amber-600"
                            )}
                          >
                            {product.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 text-center text-sm font-courier text-zinc-600">
                      {product.category}
                    </div>

                    {/* Stock pills */}
                    <div className="col-span-3 flex justify-center items-center gap-2 flex-wrap">
                      {product.variants.map((v, idx) => {
                        const isOut = v.stock === 0;
                        const isLow = v.stock > 0 && v.stock < 5;
                        return (
                          <div
                            key={idx}
                            title={`${v.color} · ₦${v.price.toLocaleString()}`}
                            className={cn(
                              "flex flex-col items-center justify-center border w-11 h-12 text-center",
                              isOut
                                ? "border-[#E5C3C3] bg-[#FCF5F5] text-[#C23A3A]"
                                : isLow
                                  ? "border-[#F5E4B2] bg-[#FFFBF0] text-[#A86400]"
                                  : "border-[#E8F1FD] bg-[#F8FAFC] text-zinc-800"
                            )}
                          >
                            <span className="text-[10px] font-courier font-bold text-zinc-400 block -mt-1 leading-none uppercase">
                              {v.size}
                            </span>
                            <span className="text-sm font-semibold mt-1.5 leading-none block">
                              {v.stock < 10 && v.stock > 0
                                ? `0${v.stock}`
                                : v.stock}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-3">
                      <button
                        onClick={() => openManageStock(product)}
                        className="text-xs font-courier font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 border border-zinc-200 px-3 py-1.5 hover:border-zinc-400 transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => deleteProduct.mutate(product.id)}
                        disabled={deleteProduct.isPending}
                        className="p-2 text-zinc-400 hover:text-[#C23A3A] transition-colors disabled:opacity-40"
                        title="Delete product"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile / tablet card */}
                  <div className="lg:hidden px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-zinc-50 border border-border overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-garamound text-lg font-bold text-zinc-950 leading-tight truncate">
                            {product.name}
                          </h4>
                          {product.isFeatured && (
                            <span className="text-[9px] font-courier font-bold uppercase tracking-wider bg-[#FBF4E3] text-[#C99A36] px-1.5 py-0.5 flex-shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1">
                          {product.category} · ₦{product.basePrice.toLocaleString()} base ·{" "}
                          <span
                            className={cn(
                              "uppercase",
                              product.status === "PUBLISHED"
                                ? "text-emerald-600"
                                : product.status === "ARCHIVED"
                                  ? "text-zinc-400"
                                  : "text-amber-600"
                            )}
                          >
                            {product.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Stock pills */}
                    <div className="flex items-center gap-2 flex-wrap mt-4">
                      {product.variants.map((v, idx) => {
                        const isOut = v.stock === 0;
                        const isLow = v.stock > 0 && v.stock < 5;
                        return (
                          <div
                            key={idx}
                            title={`${v.color} · ₦${v.price.toLocaleString()}`}
                            className={cn(
                              "flex flex-col items-center justify-center border w-11 h-12 text-center",
                              isOut
                                ? "border-[#E5C3C3] bg-[#FCF5F5] text-[#C23A3A]"
                                : isLow
                                  ? "border-[#F5E4B2] bg-[#FFFBF0] text-[#A86400]"
                                  : "border-[#E8F1FD] bg-[#F8FAFC] text-zinc-800"
                            )}
                          >
                            <span className="text-[10px] font-courier font-bold text-zinc-400 block -mt-1 leading-none uppercase">
                              {v.size}
                            </span>
                            <span className="text-sm font-semibold mt-1.5 leading-none block">
                              {v.stock < 10 && v.stock > 0
                                ? `0${v.stock}`
                                : v.stock}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-4">
                      <button
                        onClick={() => openManageStock(product)}
                        className="text-xs font-courier font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 border border-zinc-200 px-3 py-1.5 hover:border-zinc-400 transition-colors"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => deleteProduct.mutate(product.id)}
                        disabled={deleteProduct.isPending}
                        className="p-2 text-zinc-400 hover:text-[#C23A3A] transition-colors disabled:opacity-40"
                        title="Delete product"
                      >
                        <MoreVertical size={16} />
                      </button>
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
                Total Products
              </p>
              <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                {pagination?.total ?? "—"} Items
              </p>
            </div>
            <div className="border-l border-border pl-8">
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Low Stock Alert
              </p>
              <p className="text-xl font-garamound font-bold text-[#C23A3A] mt-1">
                {products.reduce(
                  (acc, p) =>
                    acc +
                    p.variants.filter((v) => v.stock > 0 && v.stock < 5).length,
                  0
                )}{" "}
                Variants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-courier tracking-wide text-zinc-400">
              SHOWING {products.length} OF {pagination?.total ?? 0}
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
      <ProductDrawer />
    </div>
  );
}
