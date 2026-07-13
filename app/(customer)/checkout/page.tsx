"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Truck, Store, Lock, AlertCircle } from "lucide-react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { CreateOrderDto, Order, CheckoutResponse } from "@/types/order.types";
import { ApiSuccess } from "@/types/api.types";
import { dataTagSymbol } from "@tanstack/react-query";
import { OrderService } from "@/services/order.service";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const cartItems = [
  { id: "1", name: "'Heritage' Agbada Shell", size: "CUSTOM", color: "IVORY GOLD", price: 450000, image: null },
  { id: "2", name: "Minimalist Linen Tunic", size: "XL", color: "SAND", price: 85000, image: null },
];

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
    country: "Nigeria",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = deliveryMethod === "delivery" ? 15000 : 0;
  const total = subtotal + shipping;

  const { mutate, isPending, error: mutationError } = useApiMutation<
    ApiSuccess<CheckoutResponse>,
    CreateOrderDto
  >({
    mutationFn: (data) => OrderService.create(data),
  });

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.address.trim()) next.address = "Required";
    if (!form.city.trim()) next.city = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const updateField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handlePlaceOrder = () => {
    if (!validate()) return;
    mutate(
      {
        shippingName: `${form.firstName} ${form.lastName}`,
        shippingPhone: form.phone,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingState: form.state,
        shippingCountry: form.country,
        paymentMethod: "CARD",
        deliveryMethod,
      },
      {
        onSuccess: (data) => {
          console.log(data.data.paymentUrl)
          window.open(data.data.paymentUrl, '_blank', 'noopener, noreferrer');;
        },
      }
    );
  };

  const inputClass = (key: keyof FormState) =>
    `w-full border-b ${
      errors[key] ? "border-alert" : "border-border"
    } bg-transparent font-courier text-sm pb-2 placeholder:text-foreground/25 focus:outline-none focus:border-primary transition-colors`;

  return (
    <div className="min-h-screen bg-background">
      {/* Brand bar */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <span className="font-courier text-[10px] tracking-[0.3em] uppercase text-foreground/40">
            &apos;Toke Clothiers
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left — 3-step form */}
          <div className="lg:col-span-3 space-y-14">
            {/* 01 / Logistics */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-courier text-[10px] tracking-[0.2em] text-primary">01</span>
                <span className="text-border">/</span>
                <h2 className="font-courier text-[10px] tracking-[0.2em] uppercase text-primary">
                  Logistics
                </h2>
              </div>
              <p className="font-courier text-[10px] tracking-[0.15em] uppercase text-foreground/50 mb-5">
                Delivery Method
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doorstep */}
                <button
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`flex items-start gap-4 p-5 border-2 text-left transition-colors ${
                    deliveryMethod === "delivery"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      deliveryMethod === "delivery" ? "border-primary" : "border-border"
                    }`}
                  >
                    {deliveryMethod === "delivery" && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-foreground/40" />
                      <span className="font-courier text-[10px] tracking-[0.1em] uppercase text-foreground">
                        Doorstep Delivery
                      </span>
                    </div>
                    <p className="font-courier text-[9px] text-foreground/40 tracking-wide mt-1">
                      Standard (3–5 Business Days)
                    </p>
                    <p className="text-primary text-sm font-semibold mt-2">₦15,000</p>
                  </div>
                </button>

                {/* Pickup */}
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex items-start gap-4 p-5 border-2 text-left transition-colors ${
                    deliveryMethod === "pickup"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      deliveryMethod === "pickup" ? "border-primary" : "border-border"
                    }`}
                  >
                    {deliveryMethod === "pickup" && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-4 h-4 text-foreground/40" />
                      <span className="font-courier text-[10px] tracking-[0.1em] uppercase text-foreground">
                        Atelier Pickup
                      </span>
                    </div>
                    <p className="font-courier text-[9px] text-foreground/40 tracking-wide mt-1">
                      Lagos Main Showroom
                    </p>
                    <p className="text-foreground/50 text-sm font-semibold mt-2">Free</p>
                  </div>
                </button>
              </div>
            </section>

            {/* 02 / Destination */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-courier text-[10px] tracking-[0.2em] text-primary">02</span>
                <span className="text-border">/</span>
                <h2 className="font-courier text-[10px] tracking-[0.2em] uppercase text-primary">
                  Destination
                </h2>
              </div>
              <p className="font-courier text-[10px] tracking-[0.15em] uppercase text-foreground/50 mb-6">
                Shipping Information
              </p>

              <div className="space-y-7">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Adewale"
                      value={form.firstName}
                      onChange={updateField("firstName")}
                      className={inputClass("firstName")}
                    />
                    {errors.firstName && (
                      <p className="font-courier text-[8px] text-alert mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Okoro"
                      value={form.lastName}
                      onChange={updateField("lastName")}
                      className={inputClass("lastName")}
                    />
                    {errors.lastName && (
                      <p className="font-courier text-[8px] text-alert mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={updateField("phone")}
                    className={inputClass("phone")}
                  />
                  {errors.phone && (
                    <p className="font-courier text-[8px] text-alert mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street name and house number"
                    value={form.address}
                    onChange={updateField("address")}
                    className={inputClass("address")}
                  />
                  {errors.address && (
                    <p className="font-courier text-[8px] text-alert mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Victoria Island"
                      value={form.city}
                      onChange={updateField("city")}
                      className={inputClass("city")}
                    />
                    {errors.city && (
                      <p className="font-courier text-[8px] text-alert mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-2">
                      State
                    </label>
                    <select
                      value={form.state}
                      onChange={updateField("state")}
                      className="w-full border-b border-border bg-transparent font-courier text-sm pb-2 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* 03 / Settlement */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-courier text-[10px] tracking-[0.2em] text-primary">03</span>
                <span className="text-border">/</span>
                <h2 className="font-courier text-[10px] tracking-[0.2em] uppercase text-primary">
                  Settlement
                </h2>
              </div>
              <p className="font-courier text-[10px] tracking-[0.15em] uppercase text-foreground/50 mb-5">
                Payment Gateway
              </p>

              <div className="border border-border bg-primary/5 p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-7 h-7 bg-white border border-border flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-foreground/50" />
                  </div>
                  <span className="font-courier text-[10px] tracking-[0.12em] uppercase text-foreground">
                    Secure Checkout via Paystack
                  </span>
                </div>
                <p className="font-courier text-[9px] text-foreground/40 leading-loose">
                  You will be redirected to Paystack to complete your purchase securely
                  <br />
                  with a debit card, bank transfer, or USSD.
                </p>
              </div>

              {mutationError && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-alert/5 border border-alert/20">
                  <AlertCircle className="w-4 h-4 text-alert flex-shrink-0" />
                  <p className="font-courier text-[9px] text-alert">
                    Failed to place order. Please try again.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right — Your Order */}
          <aside className="lg:col-span-2">
            <div className="border border-border p-7 sticky top-24">
              <p className="font-courier text-[10px] tracking-[0.25em] uppercase text-foreground/40 mb-7">
                Your Order
              </p>

              {/* Items */}
              <div className="space-y-5 pb-6 border-b border-border">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-14 h-16 bg-stone-200 flex-shrink-0 relative overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-garamound text-sm font-semibold text-foreground leading-tight mb-1">
                        {item.name}
                      </p>
                      <p className="font-courier text-[9px] tracking-[0.15em] uppercase text-foreground/40 mb-2">
                        Size: {item.size} / {item.color}
                      </p>
                      <p className="text-primary text-sm font-semibold">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 py-5 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Shipping</span>
                  <span className="font-medium">₦{shipping.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline py-5">
                <span className="font-garamound text-base font-semibold">Total</span>
                <span className="text-primary font-bold text-xl">₦{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPending}
                className="w-full bg-primary text-white font-courier text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Lock className="w-3 h-3 text-foreground/25" />
                <span className="font-courier text-[8px] text-foreground/25 tracking-wider">
                  Encrypted SSL Transaction
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
