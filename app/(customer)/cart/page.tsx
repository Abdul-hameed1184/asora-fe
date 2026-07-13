"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShieldCheck, ShoppingBag, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetCart, useUpdateCart, useRemoveFromCart } from "@/hooks/useCart";
import { ApiError } from "@/lib/api/client";
import { CartLineItem } from "@/lib/api/cart.api";

const SHIPPING_FEE = 5000;

export default function CartPage() {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const { data: cart, isPending, isError, error, refetch } = useGetCart();
  const { update, isPending: updating, pendingVariantId: updatingId } = useUpdateCart();
  const { remove, isPending: removing, pendingVariantId: removingId } = useRemoveFromCart();

  // Backend 404 means the user has no cart yet — treat it as empty.
  const isEmptyCart =
    (isError && (error as ApiError)?.statusCode === 404) ||
    (!isPending && cart?.items.length === 0);

  const items: CartLineItem[] = cart?.items ?? [];

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (item.variant.price || item.variant.product.basePrice) * item.quantity,
    0
  );
  const total = subtotal + SHIPPING_FEE;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isPending) return <CartSkeleton />;

  if (isError && !isEmptyCart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-foreground/50 text-sm">Failed to load your cart.</p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Your Cart
          </p>
          <h1 className="font-garamound text-4xl font-semibold text-foreground">
            {isEmptyCart
              ? "Your cart is empty"
              : `${itemCount} ${itemCount === 1 ? "Item" : "Items"} in Your Selection`}
          </h1>
        </div>

        {isEmptyCart ? (
          <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
            <div className="w-24 h-24 rounded-full border border-border flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-foreground/20" />
            </div>
            <div>
              <h2 className="font-garamound text-2xl text-foreground mb-2">
                Nothing here yet
              </h2>
              <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
                Explore our curated collections and add pieces to your selection.
              </p>
            </div>
            <Link
              href="/shop"
              className="bg-primary text-white font-courier text-[10px] tracking-[0.2em] uppercase px-10 py-4 hover:bg-primary/90 transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Left — Cart Items */}
            <div className="lg:col-span-2">
              <div>
                {items.map((item, index) => {
                  const { variant } = item;
                  const price = variant.price || variant.product.basePrice;
                  const image =
                    variant.product.media[0]?.url ??
                    variant.product.featuredImage ??
                    null;
                  const isMutating =
                    updatingId === item.variantId || removingId === item.variantId;

                  return (
                    <div key={item.id}>
                      <div
                        className={`flex gap-6 py-8 transition-opacity ${
                          isMutating ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-24 sm:w-24 sm:h-28 bg-stone-200 flex-shrink-0 relative overflow-hidden">
                          {image ? (
                            <Image
                              src={image}
                              alt={variant.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-garamound text-lg font-semibold text-foreground mb-1">
                            {variant.product.name}
                          </h3>
                          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-5">
                            Size: {variant.size} / {variant.color}
                          </p>

                          <div className="flex items-end justify-between gap-4 flex-wrap">
                            {/* Quantity controls */}
                            <div>
                              <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-2">
                                Quantity
                              </p>
                              <div className="flex items-center border border-border">
                                <button
                                  onClick={() =>
                                    update(item.variantId, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1 || (updating && updatingId === item.variantId)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-border/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Decrease"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-10 text-center text-sm font-medium select-none">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    update(item.variantId, item.quantity + 1)
                                  }
                                  disabled={
                                    item.quantity >= variant.stock ||
                                    (updating && updatingId === item.variantId)
                                  }
                                  className="w-8 h-8 flex items-center justify-center hover:bg-border/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  aria-label="Increase"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Item total */}
                            <div className="text-right">
                              <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-1">
                                Total
                              </p>
                              <p className="text-primary font-semibold text-lg">
                                ₦{(price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => remove(item.variantId)}
                            disabled={removing && removingId === item.variantId}
                            className="flex items-center gap-1.5 mt-5 font-courier text-[10px] tracking-[0.2em] uppercase text-destructive hover:text-destructive/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X className="w-3 h-3" />
                            Remove Item
                          </button>
                        </div>
                      </div>

                      {index < items.length - 1 && (
                        <div className="border-t border-border" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Promo code */}
              <div className="border-t border-border pt-8 mt-4">
                <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-4">
                  Promotional Code
                </p>
                <div className="flex items-end gap-0">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 border-b border-border bg-transparent font-courier text-xs tracking-[0.1em] uppercase placeholder:text-foreground/25 pb-2 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={() => promoCode.trim() && setPromoApplied(true)}
                    className="font-courier text-[10px] tracking-[0.2em] uppercase text-primary border-b border-primary px-5 pb-2 hover:bg-primary hover:text-white transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="font-courier text-[10px] tracking-[0.15em] text-green-600 mt-2">
                    ✓ Promo code applied successfully
                  </p>
                )}
              </div>
            </div>

            {/* Right — Order Summary */}
            <aside className="lg:col-span-1">
              <div className="border border-border p-8 sticky top-24">
                <p className="font-courier text-[10px] tracking-[0.25em] uppercase text-foreground/40 mb-6">
                  Order Summary
                </p>

                <div className="space-y-4 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Delivery</span>
                    <span className="font-medium">₦{SHIPPING_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Taxes</span>
                    <span className="text-foreground/40 italic text-xs">Included</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline py-6">
                  <span className="font-garamound text-lg text-foreground">Total</span>
                  <span className="text-primary font-semibold text-2xl">
                    ₦{total.toLocaleString()}
                  </span>
                </div>

                <Link href="/checkout">
                  <button className="w-full bg-primary text-white font-courier text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors">
                    Proceed to Checkout
                  </button>
                </Link>

                <div className="mt-6 space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-foreground/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-courier text-[9px] tracking-[0.2em] uppercase">
                      Secured by Paystack
                    </span>
                  </div>
                  <p className="font-courier text-[9px] text-foreground/30 leading-relaxed">
                    All transactions are encrypted and secured with enterprise-grade standards.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 border-b border-border pb-8 space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex gap-6 py-8">
                  <Skeleton className="w-24 h-28 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <div className="flex justify-between items-end pt-2">
                      <Skeleton className="h-10 w-28" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
                {i < 2 && <div className="border-t border-border" />}
              </div>
            ))}
          </div>
          <aside className="lg:col-span-1">
            <Skeleton className="h-72 w-full" />
          </aside>
        </div>
      </div>
    </div>
  );
}
