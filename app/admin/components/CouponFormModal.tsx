"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/useCoupons";
import type { Coupon, DiscountType, CouponStatus } from "@/types/coupon.types";

const labelCls =
  "text-[10px] font-courier font-bold tracking-[2px] uppercase text-zinc-400 block mb-1";
const inputCls =
  "w-full px-3 py-2 bg-white border border-[#EBE8E2] text-sm text-zinc-900 focus:outline-none focus:border-[#C99A36] transition-colors";

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
}

/** "2026-08-31T23:59:59.000Z" -> "2026-08-31T23:59" (for <input type="datetime-local">) */
function toDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

/** "2026-08-31T23:59" -> ISO string for the API */
function toIso(local: string): string {
  return new Date(local).toISOString();
}

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE" as DiscountType,
  discountValue: "",
  minimumPurchase: "",
  maximumDiscount: "",
  usageLimit: "",
  usagePerCustomer: "",
  status: "ACTIVE" as CouponStatus,
  startsAt: "",
  expiresAt: "",
};

export default function CouponFormModal({ isOpen, onClose, coupon }: CouponFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error?.message ?? updateMutation.error?.message;

  const isEditMode = !!coupon;

  useEffect(() => {
    if (!isOpen) return;

    if (coupon) {
      setForm({
        code: coupon.code,
        description: coupon.description ?? "",
        discountType: coupon.discountType,
        discountValue: String(coupon.discountValue),
        minimumPurchase: coupon.minimumPurchase !== null ? String(coupon.minimumPurchase) : "",
        maximumDiscount: coupon.maximumDiscount !== null ? String(coupon.maximumDiscount) : "",
        usageLimit: coupon.usageLimit !== null ? String(coupon.usageLimit) : "",
        usagePerCustomer:
          coupon.usagePerCustomer !== null ? String(coupon.usagePerCustomer) : "",
        status: coupon.status,
        startsAt: toDatetimeLocal(coupon.startsAt),
        expiresAt: toDatetimeLocal(coupon.expiresAt),
      });
    } else {
      setForm(EMPTY_FORM);
    }

    createMutation.reset();
    updateMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, coupon]);

  if (!isOpen) return null;

  const update = <K extends keyof typeof form>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isValid =
    form.code.trim().length >= 3 &&
    Number(form.discountValue) > 0 &&
    !!form.startsAt &&
    !!form.expiresAt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minimumPurchase: form.minimumPurchase.trim() ? Number(form.minimumPurchase) : undefined,
      maximumDiscount: form.maximumDiscount.trim() ? Number(form.maximumDiscount) : undefined,
      usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : undefined,
      usagePerCustomer: form.usagePerCustomer.trim() ? Number(form.usagePerCustomer) : undefined,
      startsAt: toIso(form.startsAt),
      expiresAt: toIso(form.expiresAt),
    };

    try {
      if (isEditMode && coupon) {
        await updateMutation.mutateAsync({
          id: coupon.id,
          data: { ...payload, status: form.status },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      // Surfaced via the error banner below.
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-60 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto w-full max-w-[560px] max-h-[85vh] bg-[#FAF7F2] border border-border shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-white shrink-0">
            <h2 className="text-lg font-garamound font-bold text-zinc-900">
              {isEditMode ? "Edit Coupon" : "New Coupon"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-[#C23A3A] px-3 py-2 text-xs font-courier">
                <span className="font-bold uppercase tracking-wider shrink-0">Error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Code</label>
                <input
                  type="text"
                  placeholder="SUMMER25"
                  value={form.code}
                  onChange={update("code")}
                  className={`${inputCls} uppercase`}
                />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={form.status}
                  onChange={update("status")}
                  disabled={!isEditMode}
                  className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <input
                type="text"
                placeholder="25% off summer collection"
                value={form.description}
                onChange={update("description")}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Discount Type</label>
                <select value={form.discountType} onChange={update("discountType")} className={inputCls}>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Discount Value {form.discountType === "PERCENTAGE" ? "(%)" : "(₦)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={update("discountValue")}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Minimum Purchase (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={form.minimumPurchase}
                  onChange={update("minimumPurchase")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Maximum Discount (₦)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={form.maximumDiscount}
                  onChange={update("maximumDiscount")}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={update("usageLimit")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Usage Per Customer</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={form.usagePerCustomer}
                  onChange={update("usagePerCustomer")}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Starts At</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={update("startsAt")}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Expires At</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={update("expiresAt")}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isValid || isPending}
                className="flex items-center gap-1.5 bg-[#C99A36] hover:bg-[#B0852E] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider transition-colors"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-courier font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
