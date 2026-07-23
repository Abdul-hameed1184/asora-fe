"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useCart";
import { Product } from "@/lib/api/products.api";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { submit: addToCart, isPending: addingToCart } = useAddToCart();

  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const availableSizes = [
    ...new Set(
      product.variants
        .filter((v) => !selectedColor || v.color === selectedColor)
        .map((v) => v.size)
    ),
  ];

  const selectedVariant =
    selectedColor && selectedSize
      ? product.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
      : null;

  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size and colour first");
      return;
    }
    addToCart({ variantId: selectedVariant.id!, quantity });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="relative bg-gray-100 aspect-square md:aspect-auto md:min-h-[420px]">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              No image available
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {product.category}
            </p>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-xl font-semibold text-primary">
              ₦{displayPrice.toLocaleString()}
            </p>
          </div>

          {uniqueColors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-widest">
                Color{selectedColor && `: ${selectedColor}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selectedColor === color
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-700 hover:border-primary/60 hover:text-primary"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-widest">
                Size{selectedSize && `: ${selectedSize}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const variant = product.variants.find(
                    (v) => v.size === size && (!selectedColor || v.color === selectedColor)
                  );
                  const outOfStock = variant?.stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : outOfStock
                          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                          : "border-gray-200 text-gray-700 hover:border-primary/60 hover:text-primary"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-widest">
              Quantity
            </p>
            <div className="flex items-center border border-gray-200 rounded-xl w-max overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg leading-none"
              >
                −
              </button>
              <span className="px-5 py-2 border-x border-gray-200 text-sm font-semibold min-w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(selectedVariant?.stock ?? Infinity, q + 1))
                }
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
              disabled={!inStock || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Link
              href={`/product/${product.slug ?? product.id}`}
              className="block text-center text-sm text-gray-500 hover:text-primary transition"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
