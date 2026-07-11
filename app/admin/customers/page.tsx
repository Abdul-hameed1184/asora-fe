"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  X,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  ordersPlaced: number;
  totalSpent: string;
  status: "Active" | "Inactive";
  initials: string;
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "Adaeze Okoro",
    email: "adaeze@gmail.com",
    ordersPlaced: 12,
    totalSpent: "₦1,240,000",
    status: "Active",
    initials: "AO",
  },
  {
    id: "2",
    name: "Tunde Folawiyo",
    email: "tunde@gmail.com",
    ordersPlaced: 4,
    totalSpent: "₦820,000",
    status: "Active",
    initials: "TF",
  },
  {
    id: "3",
    name: "Yinka Shonibare",
    email: "yinka@gmail.com",
    ordersPlaced: 2,
    totalSpent: "₦185,000",
    status: "Inactive",
    initials: "YS",
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((c) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "ACTIVE" && c.status === "Active") ||
      (activeTab === "INACTIVE" && c.status === "Inactive");

    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f8]">
      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">Customers</h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Customer Database & Accounts
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-700">
            <Bell size={22} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C99A36] rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900">Olumide Ade</p>
              <p className="text-[10px] font-courier uppercase tracking-wider text-zinc-400">
                Store Manager
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border border-[#C79A35] p-0.5 overflow-hidden">
              <img
                src="/profile.jpg"
                alt="Olumide Ade"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-10 max-w-7xl mx-auto pb-20">
        {/* Actions Bar */}
        <section className="flex flex-col md:flex-row justify-between gap-6 items-center">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by client name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-border text-sm text-zinc-900 rounded-none focus:outline-none focus:border-[#C99A36] placeholder-zinc-400"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Tabs */}
            <div className="bg-zinc-100 border border-zinc-200/80 p-1 flex rounded-none">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-all",
                    activeTab === tab
                      ? "bg-white text-[#C99A36] shadow-sm border border-[#E9DFCE]"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  {tab === "ALL" ? "All Customers" : tab.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Filter by status dropdown */}
            <button className="flex items-center gap-3 bg-white border border-border px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider text-zinc-600 hover:border-zinc-400 transition-colors">
              <span>Filter by Spent</span>
              <ChevronDown size={14} />
            </button>

            {/* Settings button */}
            <button className="p-3 bg-white border border-border text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </section>

        {/* Customers Table Rows */}
        <section className="mt-8 bg-white border border-border shadow-sm overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-5">Client Details</div>
            <div className="col-span-2 text-center">Orders Placed</div>
            <div className="col-span-3 text-center">Total Value Spent</div>
            <div className="col-span-2 text-right">Status & Action</div>
          </div>

          {/* List items */}
          <div className="divide-y divide-border">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-zinc-50/50 transition-colors"
                >
                  {/* Customer Details */}
                  <div className="col-span-5 flex items-center gap-4">
                    {/* Initials Badge */}
                    <div className="h-12 w-12 rounded-full bg-[#FAF4EB] border border-[#E9DFCE] text-[#C99A36] font-semibold flex items-center justify-center text-sm font-sans flex-shrink-0">
                      {customer.initials}
                    </div>
                    <div>
                      <h4 className="font-garamound text-xl font-bold text-zinc-950 leading-tight">
                        {customer.name}
                      </h4>
                      <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  {/* Orders Placed */}
                  <div className="col-span-2 text-center text-sm font-sans text-zinc-900 font-medium">
                    {customer.ordersPlaced} Orders
                  </div>

                  {/* Total Value Spent */}
                  <div className="col-span-3 text-center text-md font-semibold text-zinc-900 font-sans">
                    {customer.totalSpent}
                  </div>

                  {/* Status & Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-center mr-2",
                        customer.status === "Active" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                        customer.status === "Inactive" && "bg-[#EAEAEA] text-[#737373]"
                      )}
                    >
                      {customer.status}
                    </span>
                    <button className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-zinc-400 font-courier">
                NO CUSTOMERS FOUND IN THIS TAB.
              </div>
            )}
          </div>
        </section>

        {/* Footer Bar */}
        <section className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-[#FAF9F6] border border-border px-8 py-5 gap-4">
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Total Client Count
              </p>
              <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                248 Clients
              </p>
            </div>
            <div className="border-l border-border pl-8">
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Active Clients
              </p>
              <p className="text-xl font-garamound font-bold text-emerald-700 mt-1">
                236 Clients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-courier tracking-wide text-zinc-400">
              SHOWING 1-10 OF 248
            </span>
            <div className="flex gap-2">
              <button className="p-2 bg-white border border-border text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="p-2 bg-white border border-border text-zinc-400 hover:text-zinc-900 hover:border-zinc-400 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
