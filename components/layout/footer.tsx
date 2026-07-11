"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4">&apos; Aṣora Clothiers</h3>
            <p className="text-gray-400 text-sm">
              Curating the finest heritage through contemporary luxury fashion.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Heritage
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-semibold mb-4">Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Our Policies
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Join the Atelier</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe for exclusive collections and heritage updates.
            </p>
            <form className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="your@example.com"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
              />
              <Button className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2026 Asora Clothiers. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
