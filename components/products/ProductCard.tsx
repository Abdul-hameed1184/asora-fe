"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { Product } from "@/lib/api/products.api";
import { QuickViewModal } from "./QuickViewModal";

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <>
      <Link href={`/product/${product.slug ?? product.id}`}>
        <div className="group">
          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}

            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`p-2 bg-white rounded-full shadow-md hover:shadow-lg transition ${
                  isWishlisted(product.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition opacity-0 group-hover:opacity-100"
                aria-label="Quick view"
              >
                <Eye className="w-5 h-5 text-gray-700 hover:text-primary" />
              </button>
            </div>
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

      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
