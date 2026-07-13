"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const BOTTOM_IMAGES = ["/cloth.png", "/hero.png", "/cloth.png"];

const STEPS = [
  { key: "PAYMENT", label: "Payment", sub: "Successful", done: true, active: false },
  { key: "PACKED", label: "Packed", sub: "In Progress", done: false, active: true },
  { key: "DELIVERY", label: "Delivery", sub: "Estimated Friday", done: false, active: false },
];

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("trxref") ?? "Check your email for the order details";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main body */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Check circle */}
        <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-7">
          <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="font-garamound text-4xl font-semibold text-foreground mb-3">
          Order Placed!
        </h1>
        <p className="font-courier text-[10px] tracking-[0.35em] uppercase text-primary mb-10">
          Order ID: {orderNumber}
        </p>

        {/* Message */}
        <p className="text-foreground/55 text-sm leading-relaxed max-w-md mb-14">
          Thank you for your patronage. Your piece of Nigerian heritage is being
          meticulously prepared. A confirmation email has been sent to your
          registered address.
        </p>

        {/* Progress tracker */}
        <div className="flex items-start justify-center mb-14">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    step.done
                      ? "bg-foreground border-foreground"
                      : step.active
                      ? "bg-background border-foreground"
                      : "bg-background border-border"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      step.done
                        ? "bg-background"
                        : step.active
                        ? "bg-foreground"
                        : "bg-border"
                    }`}
                  />
                </div>
                {/* Label */}
                <p
                  className={`font-courier text-[9px] tracking-[0.15em] uppercase mt-3 ${
                    step.done || step.active ? "text-foreground" : "text-foreground/30"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`font-courier text-[8px] mt-1 ${
                    step.done || step.active ? "text-foreground/50" : "text-foreground/25"
                  }`}
                >
                  {step.sub}
                </p>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`w-20 sm:w-32 h-px mt-5 ${
                    index === 0 ? "bg-foreground" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/track-order"
            className="bg-primary text-white font-courier text-[10px] tracking-[0.25em] uppercase px-10 py-4 hover:bg-primary/90 transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="border border-foreground text-foreground font-courier text-[10px] tracking-[0.25em] uppercase px-10 py-4 hover:bg-foreground hover:text-white transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>

      {/* Bottom atmospheric images */}
      <div className="grid grid-cols-3 h-48 sm:h-64">
        {BOTTOM_IMAGES.map((src, i) => (
          <div key={i} className="relative overflow-hidden bg-stone-900">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover opacity-60 grayscale"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
