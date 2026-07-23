"use client";

import Link from "next/link";
import { Camera, Globe, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-serif font-bold mb-4">ÀṢỌ́RA Clothiers</h3>
            <p className="text-gray-400 text-sm">
              Curating the finest heritage through contemporary luxury fashion.
            </p>
          </div>

          {/* About / Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-white transition">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/bespoke" className="hover:text-white transition">
                  Bespoke
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold mb-4">Customer Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/bespoke" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition">
                  Track Order
                </Link>
              </li>
              <li>
                {/* No dedicated returns page yet — placeholder until built */}
                <Link href="#" className="hover:text-white transition">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                {/* No dedicated terms page yet — placeholder until built */}
                <Link href="#" className="hover:text-white transition">
                  Terms
                </Link>
              </li>
              <li>
                {/* No dedicated privacy page yet — placeholder until built */}
                <Link href="#" className="hover:text-white transition">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Social Media</h4>
            <div className="flex gap-3">
              <Link
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white/10 transition"
              >
                <Camera className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white/10 transition"
              >
                <Globe className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white/10 transition"
              >
                <Send className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; 2026 ÀṢỌ́RA Clothiers. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/bespoke" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
