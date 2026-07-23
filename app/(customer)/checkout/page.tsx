"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Truck, Store, Lock, AlertCircle, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useGetCart } from "@/hooks/useCart";
import { CreateOrderDto, CheckoutResponse } from "@/types/order.types";
import { ApiSuccess } from "@/types/api.types";
import { ApiError } from "@/lib/api/client";
import { OrderService } from "@/services/order.service";
import { UserService } from "@/services/user.service";
import { CouponValidationService } from "@/services/couponValidation.service";
import { AuthService } from "@/services/auth.service";
import { QUERY_KEYS } from "@/hooks/queryKeys";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { Address, CreateAddressDto } from "@/types/user.type";
import toast from "react-hot-toast";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const VISIBLE_ITEM_COUNT = 2;

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  city: "",
  state: "Lagos",
  country: "Nigeria",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, _hasHydrated: hasHydrated } = useAuthStore();

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [showAllItems, setShowAllItems] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const [addressMode, setAddressMode] = useState<"saved" | "custom">("custom");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressModeInitialized, setAddressModeInitialized] = useState(false);

  // Pre-fill name/phone from the account — the Address model itself has no name/phone.
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName,
        lastName: prev.lastName || user.lastName,
        phone: prev.phone || user.phoneNumber || "",
      }));
    }
  }, [user]);

  // ── Cart ─────────────────────────────────────────────────────────────────────
  const { data: cart, isPending: cartLoading } = useGetCart();
  const items = cart?.items ?? [];
  const visibleItems = showAllItems ? items : items.slice(0, VISIBLE_ITEM_COUNT);
  const hiddenCount = Math.max(0, items.length - VISIBLE_ITEM_COUNT);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.variant.price || item.variant.product.basePrice) * item.quantity,
    0
  );
  const shipping = deliveryMethod === "delivery" ? 15000 : 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  // ── Saved addresses ──────────────────────────────────────────────────────────
  const { data: addressesData, isLoading: addressesLoading } = useApiQuery<ApiSuccess<Address[]>>({
    queryKey: QUERY_KEYS.addresses,
    queryFn: () => UserService.getAddresses(),
    enabled: !!user,
  });
  const addresses = addressesData?.data ?? [];

  useEffect(() => {
    if (addressModeInitialized || addressesLoading) return;
    if (addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
      setAddressMode("saved");
      setSelectedAddressId(defaultAddress.id);
    }
    setAddressModeInitialized(true);
  }, [addresses, addressesLoading, addressModeInitialized]);

  const { mutate: addAddress } = useApiMutation<ApiSuccess<Address>, CreateAddressDto>({
    mutationFn: (data) => UserService.addAddress(data),
    invalidateKeys: [QUERY_KEYS.addresses],
  });

  // ── Coupon ───────────────────────────────────────────────────────────────────
  const {
    mutate: validateCoupon,
    isPending: validatingCoupon,
    error: couponError,
  } = useApiMutation<ApiSuccess<{ code: string; discount: number }>, { code: string; subtotal: number }>({
    mutationFn: (data) => CouponValidationService.validate(data),
  });

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code || subtotal <= 0) return;
    validateCoupon(
      { code, subtotal },
      { onSuccess: (res) => setAppliedCoupon({ code: res.data.code, discount: res.data.discount }) }
    );
  };

  // ── Resend verification (unverified users) ──────────────────────────────────
  const { mutate: resendVerification, isPending: resendingVerification } = useApiMutation<unknown, void>({
    mutationFn: () => AuthService.resendVerification(),
  });

  // ── Order creation ───────────────────────────────────────────────────────────
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
    if (addressMode === "custom") {
      if (!form.address.trim()) next.address = "Required";
      if (!form.city.trim()) next.city = "Required";
    } else if (!selectedAddressId) {
      toast.error("Please select or add a shipping address");
    }
    setErrors(next);
    return Object.keys(next).length === 0 && (addressMode === "custom" || !!selectedAddressId);
  };

  const updateField = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const handlePlaceOrder = () => {
    if (!validate()) return;

    let shippingAddress: string;
    let shippingCity: string;
    let shippingState: string;
    let shippingCountry: string;

    if (addressMode === "saved") {
      const selected = addresses.find((a) => a.id === selectedAddressId)!;
      shippingAddress = selected.address;
      shippingCity = selected.city;
      shippingState = selected.state;
      shippingCountry = selected.country;
    } else {
      shippingAddress = form.address;
      shippingCity = form.city;
      shippingState = form.state;
      shippingCountry = form.country;
      // Save the manually-entered address to the account for next time.
      addAddress({
        address: form.address,
        street: form.address,
        city: form.city,
        state: form.state,
        zipCode: "",
        country: form.country,
        isDefault: addresses.length === 0,
      });
    }

    mutate(
      {
        shippingName: `${form.firstName} ${form.lastName}`,
        shippingPhone: form.phone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingCountry,
        paymentMethod: "CARD",
        deliveryMethod,
        couponCode: appliedCoupon?.code,
      },
      {
        onSuccess: (data) => {
          window.open(data.data.paymentUrl, "_blank", "noopener, noreferrer");
        },
      }
    );
  };

  const inputClass = (key: keyof FormState) =>
    `w-full border-b ${
      errors[key] ? "border-alert" : "border-border"
    } bg-transparent font-courier text-sm pb-2 placeholder:text-foreground/25 focus:outline-none focus:border-primary transition-colors`;

  // ── Blocking gate for unverified users ───────────────────────────────────────
  if (hasHydrated && user && !user.isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full border border-border p-10 text-center">
          <AlertCircle className="w-8 h-8 text-alert mx-auto mb-5" />
          <h2 className="font-garamound text-2xl text-foreground mb-3">
            Verify Your Email to Continue
          </h2>
          <p className="text-foreground/50 text-sm leading-relaxed mb-8">
            You need to verify your email address before you can check out.
            Please check your inbox, or resend the verification email below.
          </p>
          <button
            onClick={() =>
              resendVerification(undefined, {
                onSuccess: () => toast.success("Verification email sent — please check your inbox."),
              })
            }
            disabled={resendingVerification}
            className="w-full bg-primary text-white font-courier text-[10px] tracking-[0.25em] uppercase py-4 hover:bg-primary/90 transition-colors disabled:opacity-50 mb-4"
          >
            {resendingVerification ? "Sending…" : "Resend Verification Email"}
          </button>
          <Link
            href="/cart"
            className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

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

                {/* Saved addresses */}
                <div>
                  <label className="font-courier text-[9px] tracking-[0.2em] uppercase text-foreground/40 block mb-3">
                    Shipping Address
                  </label>

                  {addressesLoading ? (
                    <p className="font-courier text-[10px] text-foreground/30">Loading addresses…</p>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => {
                        const selected = addressMode === "saved" && selectedAddressId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setAddressMode("saved");
                              setSelectedAddressId(addr.id);
                            }}
                            className={`w-full flex items-start gap-4 p-4 border-2 text-left transition-colors ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                selected ? "border-primary" : "border-border"
                              }`}
                            >
                              {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-courier text-xs text-foreground truncate">
                                  {addr.address}
                                </p>
                                {addr.isDefault && (
                                  <span className="font-courier text-[8px] tracking-[0.15em] uppercase bg-primary/10 text-primary px-2 py-0.5 flex-shrink-0">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-courier text-[10px] text-foreground/40">
                                {addr.city}, {addr.state}, {addr.country}
                              </p>
                            </div>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setAddressMode("custom")}
                        className={`w-full flex items-center gap-4 p-4 border-2 text-left transition-colors ${
                          addressMode === "custom"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            addressMode === "custom" ? "border-primary" : "border-border"
                          }`}
                        >
                          {addressMode === "custom" && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <Plus className="w-3.5 h-3.5 text-foreground/40" />
                        <span className="font-courier text-[10px] tracking-[0.1em] uppercase text-foreground">
                          Enter a new address
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {addressMode === "custom" && (
                  <div className="space-y-7 pl-5 border-l-2 border-primary/20">
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
                    <p className="font-courier text-[8px] text-foreground/30">
                      This address will be saved to your account for next time.
                    </p>
                  </div>
                )}
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
              {cartLoading ? (
                <p className="font-courier text-[10px] text-foreground/30 pb-6 border-b border-border">
                  Loading your cart…
                </p>
              ) : items.length === 0 ? (
                <div className="pb-6 border-b border-border text-center py-6">
                  <p className="font-courier text-[10px] text-foreground/40 mb-3">Your cart is empty</p>
                  <Link href="/shop" className="font-courier text-[10px] uppercase text-primary underline">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-5 pb-4 border-b border-border">
                  {visibleItems.map((item) => {
                    const price = item.variant.price || item.variant.product.basePrice;
                    const image =
                      item.variant.product.media[0]?.url ??
                      item.variant.product.featuredImage ??
                      null;
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-14 h-16 bg-stone-200 flex-shrink-0 relative overflow-hidden">
                          {image ? (
                            <Image src={image} alt={item.variant.product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-garamound text-sm font-semibold text-foreground leading-tight mb-1">
                            {item.variant.product.name}
                          </p>
                          <p className="font-courier text-[9px] tracking-[0.15em] uppercase text-foreground/40 mb-2">
                            Size: {item.variant.size} / {item.variant.color} × {item.quantity}
                          </p>
                          <p className="text-primary text-sm font-semibold">
                            ₦{(price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllItems((v) => !v)}
                      className="w-full flex items-center justify-center gap-1.5 font-courier text-[9px] tracking-[0.15em] uppercase text-primary hover:text-primary/70 transition-colors pt-2"
                    >
                      {showAllItems ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          +{hiddenCount} more item{hiddenCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Promo code */}
              <div className="border-t border-border pt-6 mt-2">
                <p className="font-courier text-[10px] tracking-[0.2em] uppercase text-foreground/40 mb-4">
                  Promotional Code
                </p>
                <div className="flex items-end gap-0">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setAppliedCoupon(null);
                    }}
                    className="flex-1 border-b border-border bg-transparent font-courier text-xs tracking-[0.1em] uppercase placeholder:text-foreground/25 pb-2 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="font-courier text-[10px] tracking-[0.2em] uppercase text-primary border-b border-primary px-5 pb-2 hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? "Checking…" : "Apply"}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="font-courier text-[10px] tracking-[0.15em] text-green-600 mt-2">
                    ✓ Coupon {appliedCoupon.code} applied — you saved ₦{appliedCoupon.discount.toLocaleString()}
                  </p>
                )}
                {couponError && !appliedCoupon && (
                  <p className="font-courier text-[10px] tracking-[0.1em] text-alert mt-2">
                    {(couponError as ApiError).message}
                  </p>
                )}
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
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₦{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline py-5">
                <span className="font-garamound text-base font-semibold">Total</span>
                <span className="text-primary font-bold text-xl">₦{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPending || items.length === 0}
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
