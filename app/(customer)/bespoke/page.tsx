"use client";

import { useState } from "react";
import Image from "next/image";
import { Scissors, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSendBespokeInquiry } from "@/hooks/useBespokeInquiry";
import { CreateBespokeInquiryPayload } from "@/types/bespokeInquiry.types";

const CHECKLIST = [
  "Personalized Design",
  "Premium Fabrics",
  "Professional Tailoring",
  "Nationwide Delivery",
];

const PROCESS_STEPS = [
  "Share your inspiration",
  "Receive consultation",
  "Get quotation",
  "Production",
  "Delivery",
];

const BUDGET_RANGES = [
  "Under ₦50,000",
  "₦50,000 - ₦100,000",
  "₦100,000 - ₦250,000",
  "₦250,000+",
];

const BESPOKE_FAQS = [
  {
    q: "How long does a bespoke order take?",
    a: "Most bespoke pieces are ready within 2-4 weeks from consultation to delivery, depending on complexity.",
  },
  {
    q: "Do I need to visit in person for measurements?",
    a: "Not necessarily — our stylists can guide you through self-measurement over email, or arrange an in-person fitting if you're within reach.",
  },
  {
    q: "Can I supply my own fabric?",
    a: "Yes — let us know your fabric preference in the form and we'll advise on suitability for your design.",
  },
];

const initialForm: CreateBespokeInquiryPayload = {
  fullName: "",
  email: "",
  phone: "",
  occasion: "",
  description: "",
  fabricPreference: "",
  budgetRange: "",
};

export default function BespokePage() {
  const [form, setForm] = useState<CreateBespokeInquiryPayload>(initialForm);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { submit, isPending, isSuccess } = useSendBespokeInquiry();

  const handleChange =
    (field: keyof CreateBespokeInquiryPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(form, () => setForm(initialForm));
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-black text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Scissors className="w-8 h-8 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4">
            Need Something Unique?
          </h1>
          <p className="text-gray-300 mb-8">
            We create custom outfits tailored to your measurements and style.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {CHECKLIST.map((item) => (
              <span key={item} className="flex items-center gap-2 text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSuccess ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                Thank you!
              </h2>
              <p className="text-gray-600">
                Your inquiry has been sent — we&apos;ll be in touch by email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  placeholder="Full name"
                  required
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  required
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
                <Input
                  placeholder="Occasion (e.g. Wedding, Office wear)"
                  value={form.occasion}
                  onChange={handleChange("occasion")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  placeholder="Fabric preference (optional)"
                  value={form.fabricPreference}
                  onChange={handleChange("fabricPreference")}
                />
                <select
                  value={form.budgetRange}
                  onChange={handleChange("budgetRange")}
                  className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Budget range (optional)</option>
                  {BUDGET_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Tell us about your inspiration, measurements, or any details that matter to you..."
                required
                minLength={10}
                rows={5}
                value={form.description}
                onChange={handleChange("description")}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Message Our Stylist"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step} className="flex md:flex-col items-center gap-4 md:gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-gray-800">{step}</p>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block w-full h-px bg-gray-300 mt-[-2.5rem]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery of past bespoke work */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-12 text-center">
            Past Bespoke Work
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative aspect-4/5 rounded-lg overflow-hidden bg-gray-200">
                <Image src="/cloth.png" alt="Bespoke work sample" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8 text-center">
            Bespoke FAQ
          </h2>
          <div className="space-y-3">
            {BESPOKE_FAQS.map((faq, i) => (
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
