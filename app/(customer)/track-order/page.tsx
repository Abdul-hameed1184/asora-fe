"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, AlertCircle } from "lucide-react";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order.types";
import { PaginatedResponse } from "@/types/api.types";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRetrieve = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your order ID.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = (await OrderService.getOrders()) as PaginatedResponse<Order[]>;
      const found =
        (res.data as Order[]).find(
          (o) => o.orderNumber.toLowerCase() === trimmed.toLowerCase()
        ) ?? null;
      if (!found) {
        setErrorMsg("No order found with that ID. Please check and try again.");
        setLoading(false);
      } else {
        router.push(`/orders/${found.id}`);
      }
    } catch {
      setErrorMsg("Unable to retrieve order. Please sign in and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-3">
            Account
          </p>
          <h1 className="font-garamound text-4xl font-semibold text-foreground">
            Track Your Journey
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — Search form */}
          <div>
            <div className="border border-border p-8">
              <div className="space-y-8 mb-8">
                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-3">
                    Order Identification
                  </label>
                  <input
                    type="text"
                    placeholder="TX-XXXXX"
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value.toUpperCase());
                      setErrorMsg(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleRetrieve()}
                    className="w-full border-b border-border bg-transparent font-courier text-sm tracking-widest pb-2 placeholder:text-foreground/25 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="atelier@toke.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-b border-border bg-transparent font-courier text-sm pb-2 placeholder:text-foreground/25 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 mb-6 p-3 bg-alert/5 border border-alert/20">
                  <AlertCircle className="w-4 h-4 text-alert flex-shrink-0 mt-0.5" />
                  <p className="font-courier text-[9px] text-alert leading-relaxed">{errorMsg}</p>
                </div>
              )}

              <button
                onClick={handleRetrieve}
                disabled={loading}
                className="w-full bg-primary text-white font-courier text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Retrieve Status
              </button>
            </div>
          </div>

          {/* Right — Atmospheric image */}
          <div className="relative h-72 lg:h-full overflow-hidden">
            <Image src="/hero.png" alt="Atelier craftsmanship" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/45 flex items-end p-8">
              <blockquote className="font-garamound text-white text-xl italic leading-relaxed">
                &ldquo;Crafting a legacy requires time, patience, and the finest thread.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
