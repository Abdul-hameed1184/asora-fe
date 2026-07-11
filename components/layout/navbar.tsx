"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Heart, ShoppingBag, User, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore()

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-serif font-bold text-primary font-courier">
              &apos; Aṣora
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary transition"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-gray-700 hover:text-primary transition"
            >
              Shop
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-primary transition"
            >
              Orders
            </Link>

          </div>

          {user ?
            <div className="hidden md:flex items-center gap-4">
              <Link href={"/wishlist"}>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
              </Link>
              <Link href={"/cart"}>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                </button>
              </Link>
              {/* <Link href={"/cart"}> */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Bell className="w-5 h-5 text-gray-700" />
              </button>
              {/* </Link> */}
              <Link href="/profile">
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <User className="w-5 h-5 text-gray-700" />
                </button>
              </Link>
            </div>
            : <div className="hidden md:flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Heart className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <ShoppingBag className="w-5 h-5 text-gray-700" />
              </button>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </div>}
          {/* Right Icons */}


          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Collections
            </Link>
            <Link
              href="/shop"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Heritage
            </Link>
            <Link
              href="/shop"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              Journal
            </Link>
            <div className="pt-2 border-t border-gray-200 mt-2 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
