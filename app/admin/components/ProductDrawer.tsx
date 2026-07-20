"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  Star,
  Plus,
  Trash2,
  Loader2,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductDrawerStore } from "@/lib/stores/useProductDrawerStore";
import type { Variant } from "@/lib/stores/useProductDrawerStore";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useUploadImages } from "@/hooks/useUploadImages";
import CategoryManagerModal from "./CategoryManagerModal";
import type {
  CreateProductPayload,
  UpdateProductPayload,
  VariantPatch,
} from "@/lib/api/products.api";

// ---------------------------------------------------------------------------
// Canonical variant size options — must match the backend Zod enum exactly
// (backend/src/validations/product.validation.ts)
// ---------------------------------------------------------------------------
export const VARIANT_SIZES = ["XS", "S", "M", "L", "XL"] as const;

// ---------------------------------------------------------------------------
// Editable variant row — keeps numbers as strings for input binding
// ---------------------------------------------------------------------------
interface EditableVariant {
  id?: string;
  size: string;
  color: string;
  stock: string;
  price: string;
}

function toEditable(variants: Variant[]): EditableVariant[] {
  return variants.map((v) => ({
    id: v.id,
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
// Component
// ---------------------------------------------------------------------------
export default function ProductDrawer() {
  const { isOpen, mode, activeProduct, close } = useProductDrawerStore();
  const isManage = mode === "manage-stock";

  // ── File input ref ───────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── TanStack Query mutations ─────────────────────────────────────────────
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data ?? [];

  // ── Upload state ─────────────────────────────────────────────────────────
  const {
    images,
    uploadedImages,
    addImages,
    removeImage,
    retryImage,
    uploadAsync,
    clearAll,
    isUploading,
  } = useUploadImages("products");

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isPending = isSaving || isUploading;

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [careGuide, setCareGuide] = useState("");
  const [sizeGuide, setSizeGuide] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "DRAFT"
  );
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<EditableVariant[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // ── Mutation-level / client-side validation error to surface in the UI ───
  const [formError, setFormError] = useState<string | null>(null);
  const mutationError =
    formError ?? createMutation.error?.message ?? updateMutation.error?.message;

  // ── Sync when drawer opens / closes ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      createMutation.reset();
      updateMutation.reset();
      setFormError(null);
      clearAll();
      return;
    }

    if (mode === "new-product" || !activeProduct) {
      setName("");
      setDescription("");
      setCareGuide("");
      setSizeGuide("");
      setBasePrice("");
      setCategoryId("");
      setStatus("DRAFT");
      setIsFeatured(false);
      setVariants([]);
    } else {
      setName(activeProduct.name);
      setDescription(activeProduct.description);
      setCareGuide(activeProduct.careGuide);
      setSizeGuide(activeProduct.sizeGuide);
      setBasePrice(String(activeProduct.basePrice));
      setCategoryId(activeProduct.categoryId);
      setStatus(activeProduct.status);
      setIsFeatured(activeProduct.isFeatured);
      setVariants(toEditable(activeProduct.variants));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, activeProduct]);

  // ── File picker ──────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addImages(files);
    e.target.value = "";
  }

  // ── Variant helpers ─────────────────────────────────────────────────────
  const addVariantRow = () =>
    setVariants((prev) => [
      ...prev,
      { size: VARIANT_SIZES[0], color: "", stock: "", price: "" },
    ]);

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isPending) return;

    setFormError(null);

    if (!categoryId) {
      setFormError("Please select a category.");
      return;
    }

    const validVariants = variants.filter((v) => v.size.trim() && v.color.trim());
    if (validVariants.length === 0) {
      setFormError("Add at least one size variant (size + color required).");
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const parsedBasePrice = parseFloat(basePrice) || 0;

    // Upload any images that haven't been processed yet.
    const hasUnuploaded = images.some(
      (img) => img.status === "idle" || img.status === "failed"
    );
    const freshlyUploaded = hasUnuploaded ? await uploadAsync() : [];

    // Combine images uploaded in prior interactions with images just uploaded.
    const allNewUploaded = [...uploadedImages, ...freshlyUploaded];
    const newMedia = allNewUploaded.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      type: img.type as "image" | "video",
      format: img.format,
    }));

    if (isManage && activeProduct) {
      // ── Update: send only what actually changed ───────────────────────
      const patch: UpdateProductPayload = {};

      if (name !== activeProduct.name) patch.name = name;
      if (description !== activeProduct.description) patch.description = description;
      if (careGuide !== activeProduct.careGuide) patch.careGuide = careGuide;
      if (sizeGuide !== activeProduct.sizeGuide) patch.sizeGuide = sizeGuide;
      if (parsedBasePrice !== activeProduct.basePrice) patch.basePrice = parsedBasePrice;
      // Note: `category` (the name string) isn't part of `UpdateProductInput`
      // on the backend — only `categoryId` drives the relation on update.
      if (categoryId !== activeProduct.categoryId) {
        patch.categoryId = categoryId;
      }
      if (status !== activeProduct.status) patch.status = status;
      if (isFeatured !== activeProduct.isFeatured) patch.isFeatured = isFeatured;

      // Only touch media/featuredImage if new photos were actually uploaded
      // this session — existing media is left alone otherwise.
      if (newMedia.length > 0) {
        const existingMedia = (activeProduct.media ?? []).map((m) => ({
          url: m.url,
          publicId: m.publicId,
          type: m.type,
          format: m.format,
        }));
        const allMedia = [...existingMedia, ...newMedia];
        patch.media = allMedia;
        patch.featuredImage = allMedia[0]?.url ?? activeProduct.featuredImage;
      }

      // Variants: only rows with an actual change are sent, and only the
      // changed fields — existing rows are patched by `id`, rows without an
      // `id` (added via "+ ADD ROW") are brand-new and sent in full.
      const variantPatches = validVariants
        .map((v): VariantPatch | null => {
          const stock = parseInt(v.stock) || 0;
          const price = v.price.trim() ? parseFloat(v.price) : undefined;

          if (!v.id) {
            return { size: v.size, color: v.color, stock, price };
          }

          const original = activeProduct.variants.find((ov) => ov.id === v.id);
          if (!original) return { id: v.id, size: v.size, color: v.color, stock, price };

          const rowPatch: VariantPatch = { id: v.id };
          let changed = false;
          if (v.size !== original.size) {
            rowPatch.size = v.size;
            changed = true;
          }
          if (v.color !== original.color) {
            rowPatch.color = v.color;
            changed = true;
          }
          if (stock !== original.stock) {
            rowPatch.stock = stock;
            changed = true;
          }
          if (price !== undefined && price !== original.price) {
            rowPatch.price = price;
            changed = true;
          }
          return changed ? rowPatch : null;
        })
        .filter((v): v is VariantPatch => v !== null);

      if (variantPatches.length > 0) {
        patch.variants = variantPatches;
      }

      if (Object.keys(patch).length === 0) {
        setFormError("No changes to save.");
        return;
      }

      updateMutation.mutate(
        { id: activeProduct.id, payload: patch },
        { onSuccess: close }
      );
    } else {
      // ── Create: full payload required ──────────────────────────────────
      const payload: CreateProductPayload = {
        name,
        description,
        careGuide,
        sizeGuide,
        basePrice: parsedBasePrice,
        categoryId,
        category: selectedCategory?.name ?? "",
        status,
        isFeatured,
        featuredImage: newMedia[0]?.url ?? "",
        media: newMedia,
        variants: validVariants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock) || 0,
          price: v.price.trim() ? parseFloat(v.price) : undefined,
        })),
      };

      createMutation.mutate(payload, { onSuccess: close });
    }
  };

  // ── Derived photography state ────────────────────────────────────────────
  const existingMedia = isManage ? (activeProduct?.media ?? []) : [];
  const totalImages = existingMedia.length + images.length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
          onClick={isPending ? undefined : close}
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
              {isManage
                ? "Update product details & stock"
                : "Inventory Registration"}
            </p>
          </div>
          <button
            onClick={close}
            disabled={isPending}
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
              <span className="font-bold uppercase tracking-wider shrink-0">
                Error
              </span>
              <span>{mutationError}</span>
            </div>
          )}

          {/* ── Photography ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-courier font-bold tracking-[2px] uppercase text-zinc-500">
                PRODUCT PHOTOGRAPHY
              </h3>
              {totalImages > 0 && (
                <span className="text-[10px] font-courier text-zinc-400">
                  {totalImages} image{totalImages !== 1 ? "s" : ""}
                  {images.some((img) => img.status === "uploaded") &&
                    ` · ${images.filter((img) => img.status === "uploaded").length} uploaded`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* Existing images (edit mode only) — shown as static, no re-upload */}
              {existingMedia.map((item, i) => (
                <div
                  key={`existing-${i}`}
                  className="relative aspect-square overflow-hidden border border-[#EBE8E2] bg-white"
                >
                  <img
                    src={item.url}
                    alt={`media-${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-[#C99A36] text-white text-[8px] font-courier font-bold uppercase tracking-wider px-1.5 py-0.5">
                      COVER
                    </div>
                  )}
                </div>
              ))}

              {/* Newly added local images */}
              {images.map((img, i) => {
                const isCover = existingMedia.length === 0 && i === 0;
                const isActive =
                  img.status === "compressing" || img.status === "uploading";

                return (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden border border-[#EBE8E2] bg-white group"
                  >
                    <img
                      src={img.preview}
                      alt={img.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Compressing / uploading overlay */}
                    {isActive && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <Loader2
                          size={16}
                          className="text-white animate-spin"
                        />
                        {img.status === "uploading" ? (
                          <>
                            <div className="w-10 h-[3px] bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C99A36] transition-all duration-150"
                                style={{ width: `${img.progress}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-courier text-white tabular-nums">
                              {img.progress}%
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] font-courier text-white uppercase tracking-wider">
                            Compressing
                          </span>
                        )}
                      </div>
                    )}

                    {/* Failed overlay */}
                    {img.status === "failed" && (
                      <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center gap-2">
                        <span className="text-[9px] font-courier text-white uppercase tracking-wider">
                          Failed
                        </span>
                        <button
                          type="button"
                          onClick={() => retryImage(img.id)}
                          className="flex items-center gap-1 text-[9px] font-courier text-[#C99A36] uppercase tracking-wider hover:underline"
                        >
                          <RotateCcw size={9} />
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Uploaded tick */}
                    {img.status === "uploaded" && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-0.5">
                        <Check size={8} className="text-white" />
                      </div>
                    )}

                    {/* Cover badge on first new image when no existing media */}
                    {isCover && (
                      <div className="absolute top-1 left-1 bg-[#C99A36] text-white text-[8px] font-courier font-bold uppercase tracking-wider px-1.5 py-0.5">
                        COVER
                      </div>
                    )}

                    {/* Remove — only when not actively processing */}
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute bottom-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={9} className="text-white" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add photos slot */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="border border-dashed border-[#C99A36]/60 bg-white hover:bg-zinc-50 transition-colors aspect-square flex flex-col justify-center items-center gap-1.5 text-zinc-400 group disabled:pointer-events-none disabled:opacity-50"
              >
                <Camera
                  size={20}
                  className="text-zinc-300 group-hover:text-[#C99A36] transition-colors"
                />
                <span className="text-[9px] font-courier font-bold uppercase tracking-wider group-hover:text-[#C99A36] transition-colors">
                  {totalImages === 0 ? "ADD PHOTOS" : "MORE"}
                </span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
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
                <div className="flex items-center justify-between mb-1">
                  <label className={cn(labelCls, "mb-0")}>Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[#C99A36] hover:text-[#B0852E] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED"
                    )
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
                    <div className="col-span-3">
                      <select
                        value={v.size}
                        onChange={(e) =>
                          updateVariant(idx, "size", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-zinc-100 text-sm font-semibold focus:outline-none focus:border-[#C99A36] bg-transparent"
                      >
                        {VARIANT_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Red"
                        value={v.color}
                        onChange={(e) =>
                          updateVariant(idx, "color", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-zinc-100 text-sm font-semibold focus:outline-none focus:border-[#C99A36] bg-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(idx, "stock", e.target.value)
                        }
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

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="85000"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(idx, "price", e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-zinc-100 text-sm text-center font-semibold bg-zinc-50/50 focus:outline-none focus:border-[#C99A36]"
                      />
                    </div>

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
          {/* Featured toggle + status indicator */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFeatured((v) => !v)}
                disabled={isPending}
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
                <Star
                  size={10}
                  className={
                    isFeatured
                      ? "fill-[#C99A36] text-[#C99A36]"
                      : "text-zinc-400"
                  }
                />
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
              disabled={isPending}
              className="text-xs font-courier font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors py-2 disabled:opacity-40"
            >
              CANCEL
            </button>
            <button
              type="submit"
              form="product-drawer-form"
              disabled={isPending}
              className="bg-[#C99A36] hover:bg-[#B0852E] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 text-xs font-courier font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
            >
              {isPending && <Loader2 size={13} className="animate-spin" />}
              {isUploading
                ? "UPLOADING…"
                : isSaving
                  ? "SAVING…"
                  : isManage
                    ? "UPDATE PRODUCT"
                    : "SAVE PRODUCT"}
            </button>
          </div>
        </div>
      </div>

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreated={(category) => setCategoryId(category.id)}
      />
    </>
  );
}
