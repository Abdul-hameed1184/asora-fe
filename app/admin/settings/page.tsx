"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import MarketingSettingsPanel from "@/app/admin/components/MarketingSettingsPanel";
import CouponsPanel from "@/app/admin/components/CouponsPanel";

const TABS = [
  { value: "marketing", label: "Marketing" },
  { value: "coupons", label: "Coupons" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("marketing");

  return (
    <div className="min-h-screen bg-[#fbf9f8] relative">
      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">Settings</h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Coupons & Marketing Notifications
          </p>
        </div>
      </header>

      <main className="p-10 max-w-7xl mx-auto pb-20">
        {/* Tabs */}
        <div className="bg-zinc-100 border border-zinc-200/80 p-1 flex w-fit rounded-none mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-6 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-all",
                activeTab === tab.value
                  ? "bg-white text-[#C99A36] shadow-sm border border-[#E9DFCE]"
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "marketing" ? <MarketingSettingsPanel /> : <CouponsPanel />}
      </main>
    </div>
  );
}
