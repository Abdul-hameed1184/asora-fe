"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, RefreshCw, PackageSearch } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  fetchPublicProducts,
  type ProductFilters,
  type ProductListResponse,
} from "@/lib/api/products.api";
import { fetchCategories } from "@/lib/api/categories.api";
import { type Category } from "@/types/category.types";
import { productKeys } from "@/lib/queries/products.keys";
import { keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

const COLORS = [
  { hex: "#1a1a1a", name: "Black" },
  { hex: "#7b5800", name: "Brown" },
  { hex: "#c9a961", name: "Gold" },
  { hex: "#2d5016", name: "Green" },
  { hex: "#4a90e2", name: "Blue" },
];

const LIMIT_OPTIONS = [12, 24, 48];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest", sortBy: "createdAt" as const, sortOrder: "desc" as const },
  { value: "basePrice_asc", label: "Price: Low to High", sortBy: "basePrice" as const, sortOrder: "asc" as const },
  { value: "basePrice_desc", label: "Price: High to Low", sortBy: "basePrice" as const, sortOrder: "desc" as const },
  { value: "name_asc", label: "Name: A–Z", sortBy: "name" as const, sortOrder: "asc" as const },
];

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sortKey, setSortKey] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pageInput, setPageInput] = useState("1");

  const { isWishlisted, toggleWishlist } = useWishlist();

  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const selectedSort = SORT_OPTIONS.find((o) => o.value === sortKey) ?? SORT_OPTIONS[0];

  const filters = useMemo<ProductFilters>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: selectedSort.sortBy,
      sortOrder: selectedSort.sortOrder,
      category: category || undefined,
      color: color || undefined,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 200000 ? maxPrice : undefined,
    }),
    [page, limit, debouncedSearch, selectedSort, category, color, minPrice, maxPrice]
  );

  const { data, isPending, isFetching, isError, error, refetch } =
    useApiQuery<ProductListResponse>({
      queryKey: productKeys.publicList(filters),
      queryFn: () => fetchPublicProducts(filters),
      placeholderData: keepPreviousData,
    });

  const {
    data: categories = [],
    isPending: categoriesLoading,
  } = useApiQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const goToPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(p, totalPages));
      setPage(clamped);
      setPageInput(String(clamped));
    },
    [totalPages]
  );

  const handlePageInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) goToPage(parsed);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    setPageInput("1");
  };

  const handleCategoryToggle = (cat: string) => {
    setCategory((prev) => (prev === cat ? "" : cat));
    setPage(1);
    setPageInput("1");
  };

  const handleColorToggle = (hex: string) => {
    setColor((prev) => (prev === hex ? "" : hex));
    setPage(1);
    setPageInput("1");
  };

  const hasActiveFilters = !!(
    category || color || minPrice > 0 || maxPrice < 200000 || searchQuery
  );

  const clearAllFilters = () => {
    setCategory("");
    setColor("");
    setMinPrice(0);
    setMaxPrice(200000);
    setSearchQuery("");
    setPage(1);
    setPageInput("1");
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-10 w-56 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
              ))}
            </aside>
            <div className="lg:col-span-3">
              <div className="h-12 bg-gray-200 rounded animate-pulse mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4 text-center">
        <RefreshCw className="w-12 h-12 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Failed to load products</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          {error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."}
        </p>
        <Button onClick={() => refetch()} className="bg-primary">
          Try again
        </Button>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          Collections
        </h1>
        <p className="text-gray-600">
          Discover our curated collections of heritage and contemporary wear
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search */}
        <div className="mb-8">
          <input
            type="search"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
              setPageInput("1");
            }}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── Sidebar Filters ──────────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="space-y-6 sticky top-20">
              {/* Category */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
                {categoriesLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category === cat.name}
                          onChange={() => handleCategoryToggle(cat.name)}
                          className="w-4 h-4 rounded border-gray-300 accent-primary"
                        />
                        <span className="text-gray-700">{cat.name}</span>
                      </label>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-sm text-gray-400">No categories found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price (₦)</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(parseInt(e.target.value));
                      setPage(1);
                      setPageInput("1");
                    }}
                    className="w-full accent-primary"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">Min</label>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(parseInt(e.target.value) || 0);
                          setPage(1);
                          setPageInput("1");
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 block mb-1">Max</label>
                      <input
                        type="number"
                        min={minPrice}
                        max="200000"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(parseInt(e.target.value) || 200000);
                          setPage(1);
                          setPageInput("1");
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₦{minPrice.toLocaleString()}</span>
                    <span>₦{maxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(({ hex, name }) => (
                    <button
                      key={hex}
                      title={name}
                      onClick={() => handleColorToggle(hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === hex
                          ? "border-primary scale-110 ring-2 ring-primary/30"
                          : "border-gray-300 hover:border-primary"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                {color && (
                  <button
                    onClick={() => {
                      setColor("");
                      setPage(1);
                      setPageInput("1");
                    }}
                    className="mt-2 text-xs text-gray-500 hover:text-primary underline"
                  >
                    Clear color
                  </button>
                )}
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </aside>

          {/* ── Products Grid ──────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center mb-8 pb-6 border-b border-gray-200 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {pagination ? (
                  <span>
                    Showing {products.length} of {pagination.total} products
                  </span>
                ) : (
                  <span>{products.length} products</span>
                )}
                {isFetching && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                {/* Limit form */}
                <div className="flex items-center gap-2">
                  <label htmlFor="limit" className="text-gray-600 whitespace-nowrap">
                    Per page:
                  </label>
                  <select
                    id="limit"
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {LIMIT_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-gray-600">
                    Sort:
                  </label>
                  <select
                    id="sort"
                    value={sortKey}
                    onChange={(e) => {
                      setSortKey(e.target.value);
                      setPage(1);
                      setPageInput("1");
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Empty state */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <PackageSearch className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700">
                  No products found
                </h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Try adjusting your filters or search term to find what
                  you&apos;re looking for.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-150 ${
                  isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
              >
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              No image
                            </span>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition ${
                            isWishlisted(product.id)
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              isWishlisted(product.id)
                                ? "fill-rose-500 text-rose-500"
                                : "text-gray-700 hover:text-rose-500"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-primary font-semibold">
                        ₦{product.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={page <= 1 || isFetching}
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || isFetching}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(p)}
                      disabled={isFetching}
                      className={p === page ? "bg-primary text-white" : ""}
                    >
                      {p}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages || isFetching}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={page >= totalPages || isFetching}
                >
                  »
                </Button>

                {/* Jump-to-page form */}
                <form
                  onSubmit={handlePageInputSubmit}
                  className="flex items-center gap-2 ml-2"
                >
                  <span className="text-sm text-gray-500">Go to</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={isFetching}
                  >
                    Go
                  </Button>
                </form>
              </div>
            )}

            {products.length > 0 && pagination && (
              <p className="text-center text-xs text-gray-400 mt-4">
                Page {pagination.page} of {totalPages}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
