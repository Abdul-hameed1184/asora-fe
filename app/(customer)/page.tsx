"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  const newArrivals = [
    {
      id: 1,
      name: "Aurora Wrap Dress",
      price: "₦85,000",
      image: "/products/aurora.jpg",
      category: "HERITAGE COLLECTION",
    },
    {
      id: 2,
      name: "Jari Tailored Blouse",
      price: "₦62,000",
      image: "/products/jari.jpg",
      category: "NEW ARRIVALS",
    },
    {
      id: 3,
      name: "Minara Velvet Blouse",
      price: "₦78,000",
      image: "/products/minara.jpg",
      category: "HERITAGE COLLECTION",
    },
    {
      id: 4,
      name: "Aló Wrap Ensemble",
      price: "₦95,000",
      image: "/products/alo.jpg",
      category: "NEW COLLECTION",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Amara Okonkwo",
      text: "I love each piece I've purchased from TOKE. The quality and attention to detail is unmatched.",
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
      text: "Supporting local artisans never felt so luxurious. TOKE is more than fashion, it's a movement.",
      rating: 5,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
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
            Crafted for you.
            <br />
            Worn with confidence.
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover our curated collections of heritage-inspired contemporary
            fashion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Explore Store
              </Button>
            </Link>
           
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-600">See all</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500">Image</span>
                    </div>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    {item.category}
                  </p>
                  <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-primary font-semibold">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Styles Library Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                The Styles Library
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                An illustrated guide to discovering the best-loved heritage
                styles and contemporary cuts from TOKE. Each piece carries the
                story of cultural significance, ensuring you wear a piece of
                history with global appeal.
              </p>
              <Link href="/shop">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Explore Styles
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-300 aspect-square rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Style 1</span>
              </div>
              <div className="bg-gray-300 aspect-square rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Style 2</span>
              </div>
              <div className="bg-gray-300 aspect-square rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Style 3</span>
              </div>
              <div className="bg-gray-300 aspect-square rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Style 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Bespoke. Tailored. Yours.
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Each piece is crafted with precision and purpose. Discover the art
            of tailored elegance.
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Tailored Look
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12 text-center">
            The Atelier Circle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
