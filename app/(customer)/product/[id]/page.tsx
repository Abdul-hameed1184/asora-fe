"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, Check, Truck, Shield, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAddToCart } from "@/hooks/useCart";
import { Product, fetchPublicProduct } from "@/lib/api/products.api";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";

type Tab = "description" | "care" | "size";

const TAB_LABELS: Record<Tab, string> = {
  description: "Description",
  care: "Care Guide",
  size: "Size Guide",
};

const LOW_STOCK_THRESHOLD = 5;

export default function ProductPage() {
  const { id } = useParams();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const { data: product, isPending, isError, error, refetch } =
    useApiQuery<Product>({
      queryKey: ["product", id],
      queryFn: () => fetchPublicProduct(id as string),
    });

  const { submit: addToCart, isPending: addingToCart } = useAddToCart();
  const { toggleWishlist, isWishlisted, isPending: wishlistPending } = useWishlist();

  if (isPending) return <ProductSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{error?.message ?? "Failed to load product."}</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(product.featuredImage ? [product.featuredImage] : []),
    ...product.media.map((m) => m.url),
  ];

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
      ? product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        )
      : null;

  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const isLowStock =
    selectedVariant !== null &&
    selectedVariant !== undefined &&
    selectedVariant.stock > 0 &&
    selectedVariant.stock < LOW_STOCK_THRESHOLD;
  const reviewCount = product.reviews?.length ?? 0;
  const wishlisted = isWishlisted(product.id);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    const max = selectedVariant?.stock ?? Infinity;
    setQuantity((q) => Math.min(max, Math.max(1, q + delta)));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size and colour first");
      return;
    }
    addToCart({ variantId: selectedVariant.id!, quantity });
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-4/5">
              {allImages.length > 0 ? (
                <Image
                  src={allImages[selectedImageIdx]}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  No image available
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`relative rounded-xl overflow-hidden aspect-square ring-2 transition-all ${
                      selectedImageIdx === i
                        ? "ring-primary"
                        : "ring-transparent hover:ring-gray-300"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary border-0 font-medium">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-base">★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
                {!!product.soldCount && (
                  <span className="text-sm text-gray-500">· {product.soldCount} sold</span>
                )}
              </div>
            </div>

            {/* Price + low-stock pill */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                ₦{displayPrice.toLocaleString()}
              </span>
              {selectedVariant && selectedVariant.price !== product.basePrice && (
                <span className="text-lg text-gray-400 line-through">
                  ₦{product.basePrice.toLocaleString()}
                </span>
              )}
              {isLowStock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Only {selectedVariant!.stock} remaining
                </span>
              )}
            </div>

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-widest">
                  Color{selectedColor && `: ${selectedColor}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
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

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-widest">
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
                        className={`w-12 h-12 rounded-lg text-sm font-medium border transition-all ${
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
                {selectedVariant && !isLowStock && (
                  <p className="mt-2 text-xs text-gray-400">
                    {selectedVariant.stock} in stock
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-widest">Quantity</p>
              <div className="flex items-center border border-gray-200 rounded-xl w-max overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition text-xl leading-none"
                >
                  −
                </button>
                <span className="px-6 py-3 border-x border-gray-200 text-sm font-semibold min-w-14 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition text-xl leading-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                disabled={!inStock || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/5 font-semibold"
                disabled={!inStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-3">
              <button
                onClick={handleWishlist}
                disabled={wishlistPending}
                className={`flex items-center justify-center gap-2 flex-1 py-3 border rounded-xl text-sm transition-all disabled:opacity-60 ${
                  wishlisted
                    ? "border-rose-300 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-600 hover:text-rose-500 hover:border-rose-200"
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                {wishlisted ? "Wishlisted" : "Wishlist"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-primary hover:border-primary/40 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center">
                <Truck className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-500 leading-snug">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-500 leading-snug">Authentic Guarantee</p>
              </div>
              <div className="text-center">
                <Check className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-gray-500 leading-snug">Quality Promise</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Details Tabs ── */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="flex gap-8 border-b border-gray-200">
            {(["description", "care", "size"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <div className="py-8 max-w-2xl">
            {activeTab === "description" && (
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            )}
            {activeTab === "care" && (
              <p className="text-gray-700 leading-relaxed">{product.careGuide}</p>
            )}
            {activeTab === "size" && (
              <p className="text-gray-700 leading-relaxed">{product.sizeGuide}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          <div className="space-y-4">
            <Skeleton className="w-full aspect-4/5 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-10 w-36" />

            <div className="space-y-2">
              <Skeleton className="h-3 w-14" />
              <div className="flex gap-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-10" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-lg" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />

            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="flex gap-8 border-b border-gray-200 pb-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
          <div className="py-8 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
