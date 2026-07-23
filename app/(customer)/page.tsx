"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Scissors,
  Tag,
  Headphones,
  Star,
  ChevronDown,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/ProductCard";
import { FlashSaleCountdown } from "@/components/home/FlashSaleCountdown";
import { usePublicProducts, usePublicProduct } from "@/hooks/useProducts";
import { useApiQuery } from "@/hooks/useApiQuery";
import { fetchCategories } from "@/lib/api/categories.api";
import { type Category } from "@/types/category.types";
import { useRecentlyViewedIds } from "@/hooks/useRecentlyViewed";
import toast from "react-hot-toast";

const TRUST_INDICATORS = [
  { icon: Sparkles, label: "Premium Fabrics" },
  { icon: Truck, label: "Nationwide Delivery" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: BadgeCheck, label: "Quality Craftsmanship" },
];

const WHY_CHOOSE_US = [
  { icon: Sparkles, label: "Premium Materials" },
  { icon: Scissors, label: "Expert Tailoring" },
  { icon: Tag, label: "Affordable Luxury" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Headphones, label: "Excellent Customer Support" },
  { icon: ShieldCheck, label: "Secure Checkout" },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Amara Okonkwo",
    text: "I love each piece I've purchased from ÀṢỌ́RA. The quality and attention to detail is unmatched.",
    rating: 5,
  },
  {
    id: 2,
    name: "Zainab Hassan",
    text: "Each fabric tells a story of heritage. My favorite is the Ankara collection - truly exceptional.",
    rating: 5,
  },
  {
    id: 3,
    name: "Chioma Adeyemi",
    text: "Supporting local artisans never felt so luxurious. ÀṢỌ́RA is more than fashion, it's a movement.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "How long is delivery?",
    a: "Most orders arrive within 3-7 business days, depending on your location within Nigeria.",
  },
  {
    q: "Do you ship nationwide?",
    a: "Yes — we deliver to every state in Nigeria.",
  },
  {
    q: "Can I return products?",
    a: "Yes, unworn items with tags attached can be returned within 7 days of delivery.",
  },
  {
    q: "Can I request custom sizing?",
    a: "Absolutely — visit our Bespoke page to share your measurements and preferences with our stylists.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept card payments and bank transfers via our secure checkout.",
  },
];

// A fixed, forward-dated placeholder — purely a presentational urgency element.
const FLASH_SALE_TARGET = new Date("2026-08-01T00:00:00Z");

function RecentlyViewedItem({ id }: { id: string }) {
  const { data: product } = usePublicProduct(id);
  if (!product) return null;
  return <ProductCard product={product} />;
}

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: categories = [], isPending: categoriesLoading } = useApiQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60_000,
  });

  // Sorted newest-first — doubles as the New Arrivals list and the sample used
  // to spotlight a real category for the Featured Collection banner.
  const { data: sample, isPending: sampleLoading } = usePublicProducts({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 60,
  });
  const sampleProducts = sample?.data ?? [];
  const newArrivals = sampleProducts.slice(0, 8);

  const { data: bestSellersData, isPending: bestSellersLoading } = usePublicProducts({
    sortBy: "soldCount",
    sortOrder: "desc",
    limit: 8,
  });
  const bestSellers = bestSellersData?.data ?? [];

  const { data: featuredData, isPending: featuredLoading } = usePublicProducts({
    featured: true,
    limit: 8,
  });
  const featuredProducts = featuredData?.data ?? [];

  const topCategory = useMemo(() => {
    if (sampleProducts.length === 0) return null;
    const tally = new Map<string, number>();
    for (const p of sampleProducts) {
      if (!p.category) continue;
      tally.set(p.category, (tally.get(p.category) ?? 0) + 1);
    }
    const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  }, [sampleProducts]);

  const featuredCollectionProducts = useMemo(
    () => (topCategory ? sampleProducts.filter((p) => p.category === topCategory).slice(0, 6) : []),
    [sampleProducts, topCategory]
  );

  const lookbookProducts = (featuredProducts.length > 0 ? featuredProducts : sampleProducts).slice(0, 6);

  const recentlyViewedIds = useRecentlyViewedIds();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success("Thanks for subscribing! Watch your inbox for exclusive offers.");
    setNewsletterEmail("");
  };

  return (
    <div className="w-full">
      {/* 1. Hero */}
      <section
        className="relative bg-black text-white h-screen md:h-[600px] flex items-center justify-center"
        style={{
          backgroundImage: "url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
            Premium Ready-to-Wear Fashion
            <br />
            for Every Occasion
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover elegant styles crafted for confidence and comfort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Shop Collection
              </Button>
            </Link>
            <Link href="/bespoke">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
              >
                Order Bespoke Outfit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Indicators */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {TRUST_INDICATORS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Shop by Category */}
      {(categoriesLoading || categories.length > 0) && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoriesLoading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-4/3 rounded-xl" />)
                : categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-black flex items-end p-4"
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <span className="relative text-white font-serif text-lg font-semibold">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. New Arrivals */}
      {(sampleLoading || newArrivals.length > 0) && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12">
              New Arrivals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleLoading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)
                : newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {/* 5. Best Sellers */}
      {(bestSellersLoading || bestSellers.length > 0) && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-12">
              <Star className="w-6 h-6 text-primary fill-primary" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                Best Sellers
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellersLoading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)
                : bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

  

      {/* 7. Bespoke CTA */}
      <section className="relative py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 order-2 md:order-1">
            <Image src="/cloth.png" alt="Bespoke tailoring" fill className="object-cover" />
          </div>
          <div className="order-1 md:order-2">
            <Scissors className="w-8 h-8 text-primary mb-4" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Looking for something made exclusively for you?
            </h2>
            <ul className="space-y-2 text-gray-600 mb-8">
              <li>✓ Custom measurements</li>
              <li>✓ Choice of fabric</li>
              <li>✓ Personalized fitting</li>
            </ul>
            <Link href="/bespoke">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Contact Stylist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Why Choose Us */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {WHY_CHOOSE_US.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Customer Reviews */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Featured Products — hidden entirely when nothing is marked featured */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. Promotional Banner */}
      {/* <section className="py-16 md:py-24 bg-primary text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-widest mb-2 opacity-90">Weekend Sale</p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Up to 30% Off</h2>
          <Link href="/shop">
            <Button size="lg" className="bg-black hover:bg-black/80 text-white">
              Shop Now
            </Button>
          </Link>
        </div>
      </section> */}

      {/* 12. Style Inspiration / Lookbook */}
      {lookbookProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
              Style Inspiration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lookbookProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug ?? product.id}`}
                  className="group relative aspect-4/5 rounded-xl overflow-hidden bg-gray-200"
                >
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium">{product.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 13. Instagram Gallery */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12 text-center">
            <Camera className="w-8 h-8 text-primary mb-3" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              Follow Us @asora.ng
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
              >
                <Camera className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Flash Sale */}
      {/* <section className="py-16 md:py-24 bg-black text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Flash Sale</h2>
          <FlashSaleCountdown targetDate={FLASH_SALE_TARGET} />
          <div className="mt-10">
            <Link href="/shop">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Shop the Sale
              </Button>
            </Link>
          </div>
        </div>
      </section> */}

      {/* 15. Recently Viewed */}
      {recentlyViewedIds.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewedIds.map((id) => (
                <RecentlyViewedItem key={id} id={id} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 16. Newsletter */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-600 mb-8">Get exclusive offers and new arrival alerts.</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              required
              placeholder="your@example.com"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* 17. FAQ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <p className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
