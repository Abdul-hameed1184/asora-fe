"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Ban,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageSizeSelect } from "@/components/ui/PageSizeSelect";
import {
  useCoupons,
  useDeleteCoupon,
  useActivateCoupon,
  useDeactivateCoupon,
  useExpireCoupon,
} from "@/hooks/useCoupons";
import type { Coupon, CouponStatus, DiscountType } from "@/types/coupon.types";
import CouponFormModal from "./CouponFormModal";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Expired", value: "EXPIRED" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed Amount", value: "FIXED_AMOUNT" },
];

function formatDiscount(type: DiscountType, value: number) {
  return type === "PERCENTAGE" ? `${value}% off` : `₦${value.toLocaleString()} off`;
}

function statusBadgeClass(status: CouponStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "INACTIVE":
      return "bg-zinc-100 text-zinc-600 border-zinc-200";
    case "EXPIRED":
      return "bg-red-50 text-[#C23A3A] border-red-200";
  }
}

export default function CouponsPanel() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data, isPending, isFetching, isError, error, refetch } = useCoupons({
    page,
    limit,
    search: search || undefined,
    status: (statusFilter as CouponStatus) || undefined,
    discountType: (discountTypeFilter as DiscountType) || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const deleteCoupon = useDeleteCoupon();
  const activateCoupon = useActivateCoupon();
  const deactivateCoupon = useDeactivateCoupon();
  const expireCoupon = useExpireCoupon();

  const coupons = data?.data ?? [];
  const pagination = data?.pagination;

  const hasActiveFilters = !!search || !!statusFilter || !!discountTypeFilter;
  const isEmpty = !isPending && !isError && coupons.length === 0;

  const openCreate = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <section className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-border text-sm text-zinc-900 rounded-none focus:outline-none focus:border-[#C99A36] placeholder-zinc-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <FilterSelect
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            placeholder="Status"
          />
          <FilterSelect
            value={discountTypeFilter}
            onChange={(v) => {
              setDiscountTypeFilter(v);
              setPage(1);
            }}
            options={DISCOUNT_TYPE_OPTIONS}
            placeholder="Discount Type"
          />
          <button
            onClick={openCreate}
            className="bg-[#C99A36] hover:bg-[#B0852E] text-white flex items-center gap-2 px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>New Coupon</span>
          </button>
        </div>
      </section>

      {/* Table */}
      <section
        className={cn(
          "bg-white border border-border shadow-sm overflow-hidden transition-opacity duration-200",
          isFetching && !isPending && "opacity-70"
        )}
      >
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
          <div className="col-span-4">Coupon</div>
          <div className="col-span-2 text-center">Discount</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Usage</div>
          <div className="col-span-1 text-center">Expires</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {isPending && (
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-8 py-6 items-center animate-pulse">
                <div className="col-span-4 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/2" />
                  <div className="h-3 bg-zinc-100 rounded w-3/4" />
                </div>
                <div className="col-span-2 h-4 bg-zinc-100 rounded mx-auto w-16" />
                <div className="col-span-2 h-5 bg-zinc-100 rounded-full mx-auto w-16" />
                <div className="col-span-1 h-4 bg-zinc-100 rounded mx-auto w-10" />
                <div className="col-span-1 h-4 bg-zinc-100 rounded mx-auto w-14" />
                <div className="col-span-2 h-4 bg-zinc-100 rounded ml-auto w-20" />
              </div>
            ))}
          </div>
        )}

        {isError && !isPending && (
          <ErrorState
            title="Could not load coupons"
            message={(error as Error)?.message}
            onRetry={() => refetch()}
          />
        )}

        {isEmpty && (
          <EmptyState
            icon={Ticket}
            title="No coupons found"
            description={
              hasActiveFilters
                ? "No coupons match the current filters."
                : "You haven't created any coupons yet."
            }
            actionLabel={!hasActiveFilters ? "Create First Coupon" : undefined}
            actionIcon={!hasActiveFilters ? Plus : undefined}
            onAction={!hasActiveFilters ? openCreate : undefined}
          />
        )}

        {!isPending && !isError && coupons.length > 0 && (
          <div className="divide-y divide-border">
            {coupons.map((coupon) => {
              const isExpiredByDate = new Date(coupon.expiresAt) < new Date();

              return (
                <div
                  key={coupon.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="lg:col-span-4 min-w-0">
                    <p className="font-garamound text-lg font-bold text-zinc-950 tracking-wide">
                      {coupon.code}
                    </p>
                    {coupon.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {coupon.description}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2 text-center text-sm font-courier text-zinc-700">
                    {formatDiscount(coupon.discountType, coupon.discountValue)}
                  </div>

                  <div className="lg:col-span-2 flex justify-center">
                    <Badge className={cn("border", statusBadgeClass(coupon.status))}>
                      {coupon.status}
                    </Badge>
                  </div>

                  <div className="lg:col-span-1 text-center text-xs font-courier text-zinc-600">
                    {coupon.usageLimit !== null ? `— / ${coupon.usageLimit}` : "∞"}
                  </div>

                  <div className="lg:col-span-1 text-center text-xs font-courier text-zinc-500">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="p-2 text-zinc-400 hover:text-[#C99A36] transition-colors"
                      title="Edit coupon"
                    >
                      <Pencil size={15} />
                    </button>

                    {coupon.status !== "ACTIVE" ? (
                      <button
                        onClick={() => activateCoupon.mutate(coupon.id)}
                        disabled={activateCoupon.isPending || isExpiredByDate}
                        className="p-2 text-zinc-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                        title={isExpiredByDate ? "Cannot activate an expired coupon" : "Activate"}
                      >
                        <Power size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivateCoupon.mutate(coupon.id)}
                        disabled={deactivateCoupon.isPending}
                        className="p-2 text-zinc-400 hover:text-amber-600 transition-colors disabled:opacity-40"
                        title="Deactivate"
                      >
                        <PowerOff size={15} />
                      </button>
                    )}

                    {coupon.status !== "EXPIRED" && (
                      <button
                        onClick={() => expireCoupon.mutate(coupon.id)}
                        disabled={expireCoupon.isPending}
                        className="p-2 text-zinc-400 hover:text-[#C23A3A] transition-colors disabled:opacity-40"
                        title="Force expire"
                      >
                        <Ban size={15} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) {
                          deleteCoupon.mutate(coupon.id);
                        }
                      }}
                      disabled={deleteCoupon.isPending}
                      className="p-2 text-zinc-400 hover:text-[#C23A3A] transition-colors disabled:opacity-40"
                      title="Delete coupon"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination footer */}
      {!isPending && !isError && coupons.length > 0 && (
        <section className="flex flex-col sm:flex-row justify-between items-center bg-[#FAF9F6] border border-border px-8 py-5 gap-4">
          <span className="text-xs font-courier tracking-wide text-zinc-400">
            SHOWING {coupons.length} OF {pagination?.total ?? 0}
          </span>

          <div className="flex items-center gap-6">
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
      )}

      <CouponFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        coupon={editingCoupon}
      />
    </div>
  );
}
