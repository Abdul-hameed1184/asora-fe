"use client";

import React, { useState, useEffect } from "react";
import { X, Camera, Star, Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useProductDrawerStore,
} from "@/lib/stores/useProductDrawerStore";
import type { Variant } from "@/lib/stores/useProductDrawerStore";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import type { CreateProductPayload } from "@/lib/api/products.api";

// ---------------------------------------------------------------------------
// Editable variant row — keeps numbers as strings for input binding
// ---------------------------------------------------------------------------
interface EditableVariant {
  size: string;
  color: string;
  stock: string;
  price: string;
}

const DEFAULT_VARIANTS: EditableVariant[] = [
  { size: "S", color: "Red", stock: "30", price: "80000" },
  { size: "M", color: "Red", stock: "50", price: "85000" },
];

function toEditable(variants: Variant[]): EditableVariant[] {
  return variants.map((v) => ({
    size: v.size,
    color: v.color,
    stock: String(v.stock),
    price: String(v.price),
  }));
}

// ---------------------------------------------------------------------------
// Shared label + input style helpers
// ---------------------------------------------------------------------------
const labelCls =
  "text-[10px] font-courier font-bold tracking-[2px] uppercase text-zinc-400 block mb-1";
const inputCls =
  "w-full px-4 py-2.5 bg-white border border-[#EBE8E2] text-sm text-zinc-900 focus:outline-none focus:border-[#C99A36] transition-colors";

// ---------------------------------------------------------------------------
// Component — no longer needs callback props; mutations are self-contained
// ---------------------------------------------------------------------------
export default function ProductDrawer() {
  const { isOpen, mode, activeProduct, close } = useProductDrawerStore();
  const isManage = mode === "manage-stock";

  // ── TanStack Query mutations ─────────────────────────────────────────────
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [careGuide, setCareGuide] = useState("");
  const [sizeGuide, setSizeGuide] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [category, setCategory] = useState("Dresses");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "DRAFT"
  );
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<EditableVariant[]>(DEFAULT_VARIANTS);

  // ── Mutation-level error to surface in the UI ────────────────────────────
  const mutationError =
    createMutation.error?.message ?? updateMutation.error?.message;

  // ── Sync when drawer opens ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      // Reset mutation state when drawer closes so stale errors don't persist.
      createMutation.reset();
      updateMutation.reset();
      return;
    }

    if (mode === "new-product" || !activeProduct) {
      setName("");
      setDescription("");
      setCareGuide("");
      setSizeGuide("");
      setBasePrice("");
      setCategoryId("");
      setCategory("Dresses");
      setStatus("DRAFT");
      setIsFeatured(false);
      setVariants(DEFAULT_VARIANTS);
    } else {
      setName(activeProduct.name);
      setDescription(activeProduct.description);
      setCareGuide(activeProduct.careGuide);
      setSizeGuide(activeProduct.sizeGuide);
      setBasePrice(String(activeProduct.basePrice));
      setCategoryId(activeProduct.categoryId);
      setCategory(activeProduct.category);
      setStatus(activeProduct.status);
      setIsFeatured(activeProduct.isFeatured);
      setVariants(toEditable(activeProduct.variants));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, activeProduct]);

  // ── Variant helpers ─────────────────────────────────────────────────────
  const addVariantRow = () =>
    setVariants((prev) => [...prev, { size: "", color: "", stock: "", price: "" }]);

  const removeVariantRow = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  const updateVariant = (
    idx: number,
    field: keyof EditableVariant,
    value: string
  ) =>
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    const payload: CreateProductPayload = {
      name,
      description,
      careGuide,
      sizeGuide,
      basePrice: parseFloat(basePrice) || 0,
      categoryId,
      category,
      status,
      isFeatured,
      featuredImage: activeProduct?.featuredImage ?? "/cloth.png",
      media: activeProduct?.media ?? [],
      variants: variants
        .filter((v) => v.size.trim())
        .map((v) => ({
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock) || 0,
          price: parseFloat(v.price) || 0,
        })),
    };

    if (isManage && activeProduct) {
      updateMutation.mutate(
        { id: activeProduct.id, payload },
        { onSuccess: close }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: close });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
          onClick={isSaving ? undefined : close}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[680px] bg-[#FAF7F2] border-l border-border z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-border bg-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-garamound font-bold text-zinc-900">
              {isManage ? "Edit Product" : "New Product"}
            </h2>
            <p className="text-[9px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
              {isManage ? "Update product details & stock" : "Inventory Registration"}
            </p>
          </div>
          <button
            onClick={close}
            disabled={isSaving}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <form
          id="product-drawer-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-8"
        >
          {/* ── Mutation error banner ──────────────────────────────────── */}
          {mutationError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-[#C23A3A] px-4 py-3 text-xs font-courier">
              <span className="font-bold uppercase tracking-wider shrink-0">Error</span>
              <span>{mutationError}</span>
            </div>
          )}

          {/* ── Photography ──────────────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500 mb-3">
              PRODUCT PHOTOGRAPHY
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {/* Featured image slot */}
              <div className="relative border border-dashed border-[#C99A36]/60 bg-white hover:bg-zinc-50 transition-colors cursor-pointer aspect-square flex flex-col justify-center items-center p-2 text-center text-zinc-400 group overflow-hidden">
                {isManage && activeProduct?.featuredImage ? (
                  <>
                    <img
                      src={activeProduct.featuredImage}
                      alt="cover"
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={18} className="text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera
                      size={24}
                      className="text-zinc-300 group-hover:text-[#C99A36] transition-colors mb-2"
                    />
                    <span className="text-[10px] font-courier font-bold uppercase tracking-wider group-hover:text-[#C99A36] transition-colors">
                      COVER
                    </span>
                  </>
                )}
              </div>

              {/* Additional media slots */}
              {[0, 1, 2].map((i) => {
                const mediaItem = activeProduct?.media[i];
                return (
                  <div
                    key={i}
                    className="border border-[#EBE8E2] bg-white aspect-square relative overflow-hidden group cursor-pointer hover:border-[#C99A36]/40 transition-colors"
                  >
                    {mediaItem ? (
                      <>
                        <img
                          src={mediaItem.url}
                          alt={`media-${i}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={14} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={14} className="text-zinc-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Core details ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={labelCls}>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Eko Linen Caftan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelCls}>Category</label>
                <input
                  type="text"
                  placeholder="Dresses"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                  }
                  className={inputCls}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Base Price */}
              <div>
                <label className={labelCls}>Base Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="85000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                placeholder="A modern take on traditional Nigerian silhouettes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(inputCls, "h-[200px] resize-none")}
              />
            </div>
          </div>

          {/* ── Care & Size guide ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Care Guide</label>
              <textarea
                placeholder="Hand wash in cold water..."
                value={careGuide}
                onChange={(e) => setCareGuide(e.target.value)}
                className={cn(inputCls, "h-[100px] resize-none")}
              />
            </div>
            <div>
              <label className={labelCls}>Size Guide</label>
              <textarea
                placeholder="True to size. Model is 5'9&quot; wearing size M..."
                value={sizeGuide}
                onChange={(e) => setSizeGuide(e.target.value)}
                className={cn(inputCls, "h-[100px] resize-none")}
              />
            </div>
          </div>

          {/* ── Variants ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500">
                SIZE VARIANTS
              </h3>
              <button
                type="button"
                onClick={addVariantRow}
                className="flex items-center gap-1 text-[11px] font-courier font-bold tracking-wider text-[#C99A36] hover:text-[#B0852E] uppercase transition-colors"
              >
                <Plus size={12} />
                ADD ROW
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-3 text-[10px] font-courier font-bold uppercase tracking-wider text-zinc-400 px-2">
              <div className="col-span-3">Size</div>
              <div className="col-span-3">Color</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-3">Price (₦)</div>
              <div className="col-span-1" />
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {variants.map((v, idx) => {
                const stock = parseInt(v.stock) || 0;
                const isOut = stock === 0 && v.stock !== "";
                const isLow = stock > 0 && stock < 5;

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3 items-center bg-white border border-[#EBE8E2] p-2 hover:border-[#C99A36]/40 transition-colors"
                  >
                    {/* Size */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="S"
                        value={v.size}
                        onChange={(e) => updateVariant(idx, "size", e.target.value)}
                        className="w-full px-2 py-1.5 border border-zinc-100 text-sm font-semibold focus:outline-none focus:border-[#C99A36] bg-transparent"
                      />
                    </div>

                    {/* Color */}
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Red"
                        value={v.color}
                        onChange={(e) => updateVariant(idx, "color", e.target.value)}
                        className="w-full px-2 py-1.5 border border-zinc-100 text-sm font-semibold focus:outline-none focus:border-[#C99A36] bg-transparent"
                      />
                    </div>

                    {/* Stock */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                        className={cn(
                          "w-full px-2 py-1.5 border text-sm text-center font-semibold focus:outline-none focus:border-[#C99A36]",
                          isOut
                            ? "border-[#E5C3C3] bg-[#FCF5F5] text-[#C23A3A]"
                            : isLow
                              ? "border-[#F5E4B2] bg-[#FFFBF0] text-[#A86400]"
                              : "border-zinc-100 bg-zinc-50/50"
                        )}
                      />
                    </div>

                    {/* Price */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="85000"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                        className="w-full px-2 py-1.5 border border-zinc-100 text-sm text-center font-semibold bg-zinc-50/50 focus:outline-none focus:border-[#C99A36]"
                      />
                    </div>

                    {/* Delete row */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeVariantRow(idx)}
                        className="p-1 text-zinc-300 hover:text-[#C23A3A] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {variants.length === 0 && (
                <p className="text-xs font-courier text-zinc-400 text-center py-4">
                  No variants yet. Click + ADD ROW to start.
                </p>
              )}
            </div>
          </div>
        </form>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="px-8 py-5 border-t border-border bg-[#FAF7F2] flex justify-between items-center flex-shrink-0">
          {/* Featured toggle + storefront visibility */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFeatured((v) => !v)}
                disabled={isSaving}
                className={cn(
                  "w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center disabled:opacity-40",
                  isFeatured ? "bg-[#C99A36]" : "bg-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 block",
                    isFeatured ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <span className="flex items-center gap-1 text-[10px] font-courier font-bold tracking-[2px] uppercase text-zinc-500">
                <Star size={10} className={isFeatured ? "fill-[#C99A36] text-[#C99A36]" : "text-zinc-400"} />
                Featured
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  status === "PUBLISHED"
                    ? "bg-emerald-500"
                    : status === "ARCHIVED"
                      ? "bg-zinc-400"
                      : "bg-amber-400"
                )}
              />
              <span className="text-[10px] font-courier font-bold tracking-[2px] uppercase text-zinc-500">
                {status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={close}
              disabled={isSaving}
              className="text-xs font-courier font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors py-2 disabled:opacity-40"
            >
              CANCEL
            </button>
            <button
              type="submit"
              form="product-drawer-form"
              disabled={isSaving}
              className="bg-[#C99A36] hover:bg-[#B0852E] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 text-xs font-courier font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              {isManage ? "UPDATE PRODUCT" : "SAVE PRODUCT"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}