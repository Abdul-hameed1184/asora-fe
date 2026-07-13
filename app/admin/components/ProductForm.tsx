"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, X, RotateCcw, Loader2 } from "lucide-react";
import { useUploadImages } from "@/hooks/useUploadImages";
import { useCreateProduct, type ProductFormData } from "@/hooks/useCreateProduct";
import type { UploadImage } from "@/types/upload.types";

interface EditableVariant {
  size: string;
  color: string;
  stock: string;
  price: string;
}

const STATUS_LABEL: Record<UploadImage["status"], string> = {
  idle: "",
  compressing: "Compressing…",
  uploading: "Uploading…",
  uploaded: "Done",
  failed: "Failed",
};

export function ProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [careGuide, setCareGuide] = useState("");
  const [sizeGuide, setSizeGuide] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<EditableVariant[]>([
    { size: "", color: "", stock: "", price: "" },
  ]);

  const {
    images,
    uploadedImages,
    addImages,
    removeImage,
    retryImage,
    uploadAsync,
    isUploading,
  } = useUploadImages("products");

  const createProduct = useCreateProduct();

  const isPending = isUploading || createProduct.isPending;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addImages(files);
    e.target.value = "";
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size: "", color: "", stock: "", price: "" }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateVariant(idx: number, field: keyof EditableVariant, value: string) {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isPending) return;

    // Upload any images that haven't been processed yet.
    // uploadAsync returns only the newly uploaded images from this call.
    const hasUnuploaded = images.some(
      (img) => img.status === "idle" || img.status === "failed"
    );
    const freshlyUploaded = hasUnuploaded ? await uploadAsync() : [];

    // Combine images uploaded in prior interactions with images just uploaded.
    const allUploaded = [...uploadedImages, ...freshlyUploaded];

    const formData: ProductFormData = {
      name,
      description,
      careGuide,
      sizeGuide,
      basePrice: parseFloat(basePrice) || 0,
      categoryId,
      status,
      isFeatured,
      variants: variants
        .filter((v) => v.size.trim())
        .map((v) => ({
          size: v.size,
          color: v.color,
          stock: parseInt(v.stock) || 0,
          price: parseFloat(v.price) || undefined,
        })),
    };

    createProduct.mutate(
      { formData, uploadedImages: allUploaded },
      { onSuccess }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Image Upload */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Images
        </span>

        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative w-24 h-24 rounded border border-zinc-200 overflow-hidden group"
            >
              <img
                src={img.preview}
                alt={img.file.name}
                className="w-full h-full object-cover"
              />

              {/* Progress overlay */}
              {(img.status === "compressing" || img.status === "uploading") && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                  <Loader2 size={14} className="text-white animate-spin" />
                  <span className="text-[10px] text-white">
                    {img.status === "uploading"
                      ? `${img.progress}%`
                      : STATUS_LABEL[img.status]}
                  </span>
                </div>
              )}

              {/* Failed overlay */}
              {img.status === "failed" && (
                <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] text-white">Failed</span>
                  <button
                    type="button"
                    onClick={() => retryImage(img.id)}
                    className="text-white"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              )}

              {/* Remove button */}
              {img.status !== "uploading" && img.status !== "compressing" && (
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
          ))}

          {/* Add images button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded border border-dashed border-zinc-300 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:border-zinc-400 transition-colors"
          >
            <Camera size={18} />
            <span className="text-[10px]">Add</span>
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

      {/* Product Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Care Guide</label>
          <input
            value={careGuide}
            onChange={(e) => setCareGuide(e.target.value)}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Size Guide</label>
          <input
            value={sizeGuide}
            onChange={(e) => setSizeGuide(e.target.value)}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Base Price</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Category ID</label>
          <input
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Status</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
            }
            className="border border-zinc-200 rounded px-3 py-2 text-sm outline-none focus:border-zinc-400"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end pb-2">
          <input
            id="isFeatured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isFeatured" className="text-sm text-zinc-600">
            Featured
          </label>
        </div>
      </div>

      {/* Variants */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Variants
        </span>

        {variants.map((v, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 items-center">
            <input
              placeholder="Size"
              value={v.size}
              onChange={(e) => updateVariant(idx, "size", e.target.value)}
              className="border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
            />
            <input
              placeholder="Color"
              value={v.color}
              onChange={(e) => updateVariant(idx, "color", e.target.value)}
              className="border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
            />
            <input
              placeholder="Stock"
              type="number"
              min={0}
              value={v.stock}
              onChange={(e) => updateVariant(idx, "stock", e.target.value)}
              className="border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
            />
            <div className="flex items-center gap-1">
              <input
                placeholder="Price"
                type="number"
                min={0}
                step="0.01"
                value={v.price}
                onChange={(e) => updateVariant(idx, "price", e.target.value)}
                className="flex-1 border border-zinc-200 rounded px-2 py-1.5 text-sm outline-none focus:border-zinc-400"
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-zinc-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="self-start text-xs text-zinc-500 hover:text-zinc-800 underline"
        >
          + Add variant
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="flex items-center justify-center gap-2 bg-zinc-900 text-white rounded px-4 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-zinc-700 transition-colors"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {isUploading ? "Uploading images…" : createProduct.isPending ? "Creating…" : "Create Product"}
      </button>
    </form>
  );
}
