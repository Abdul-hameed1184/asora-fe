"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/lib/stores/useWishlistStore";

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Account
          </p>
          <h1 className="font-garamound text-4xl font-semibold text-foreground">
            Your Wishlist
          </h1>
          {items.length > 0 && (
            <p className="font-courier text-[10px] tracking-[0.15em] uppercase text-foreground/40 mt-3">
              {items.length} {items.length === 1 ? "Piece" : "Pieces"} Saved
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
            <div className="w-24 h-24 rounded-full border border-border flex items-center justify-center">
              <Heart className="w-10 h-10 text-foreground/20" />
            </div>
            <div>
              <h2 className="font-garamound text-2xl text-foreground mb-2">
                Nothing saved yet
              </h2>
              <p className="text-foreground/50 text-sm leading-relaxed max-w-xs">
                Save pieces you love and find them here when you&apos;re ready
                to purchase.
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {items.map((item) => (
                <div key={item.id} className="group">
                  {/* Image */}
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative aspect-[3/4] bg-stone-200 overflow-hidden mb-4">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300" />
                      )}

                      {/* Remove overlay button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggle(item);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center hover:bg-alert hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-garamound text-base font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-primary font-semibold text-sm mb-4">
                    ₦{item.price.toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/product/${item.slug}`}
                      className="flex-1 border border-primary text-primary font-courier text-[9px] tracking-[0.2em] uppercase py-3 text-center hover:bg-primary hover:text-white transition-colors"
                    >
                      View Item
                    </Link>
                    <button
                      onClick={() => toggle(item)}
                      className="w-11 flex items-center justify-center border border-border hover:border-alert hover:text-alert transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 pt-10 border-t border-border text-center">
              <Link
                href="/shop"
                className="font-courier text-[10px] tracking-[0.2em] uppercase text-primary border-b border-primary pb-0.5 hover:text-primary/70 hover:border-primary/70 transition-colors"
              >
                Continue Exploring
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
