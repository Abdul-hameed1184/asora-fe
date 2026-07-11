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
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  reference: string;
  customerName: string;
  collection: string;
  sku: string;
  date: string;
  status: "In Transit" | "Delivered" | "Pending";
  value: string;
  image: string;
}

const initialOrders: Order[] = [
  {
    id: "1",
    reference: "#AS-91 381",
    customerName: "Adaeze Okoro",
    collection: "Heritage Silk Aso-Oke",
    sku: "TK-AG-2024-001",
    date: "Oct 14, 10:14",
    status: "In Transit",
    value: "₦450,000",
    image: "/cloth.png",
  },
  {
    id: "2",
    reference: "#AS-91 104",
    customerName: "Tunde Folawiyo",
    collection: "Bespoke Agbada Suite",
    sku: "TK-SE-2024-042",
    date: "Sep 11, 10:14",
    status: "Delivered",
    value: "₦820,000",
    image: "/cloth.png",
  },
  {
    id: "3",
    reference: "#AS-88111",
    customerName: "Yinka Shonibare",
    collection: "Journal Edit: Linen Wrap",
    sku: "TK-FT-2024-918",
    date: "Aug 05, 10:14",
    status: "Delivered",
    value: "₦185,000",
    image: "/cloth.png",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "DELIVERED" | "IN TRANSIT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "PENDING" && o.status === "Pending") ||
      (activeTab === "DELIVERED" && o.status === "Delivered") ||
      (activeTab === "IN TRANSIT" && o.status === "In Transit");

    const matchesSearch =
      o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sku.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f8]">
      {/* Top Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-border bg-white">
        <div>
          <h1 className="text-3xl font-garamound font-bold text-zinc-950">Orders</h1>
          <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-500 mt-1">
            Order Tracking & Management
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
              placeholder="Search by order reference, client, collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-border text-sm text-zinc-900 rounded-none focus:outline-none focus:border-[#C99A36] placeholder-zinc-400"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            {/* Tabs */}
            <div className="bg-zinc-100 border border-zinc-200/80 p-1 flex rounded-none">
              {(["ALL", "PENDING", "DELIVERED", "IN TRANSIT"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-xs font-courier font-bold uppercase tracking-wider transition-all",
                    activeTab === tab
                      ? "bg-white text-[#C99A36] shadow-sm border border-[#E9DFCE]"
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  {tab === "ALL" ? "All Orders" : tab.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Filter by date dropdown */}
            <button className="flex items-center gap-3 bg-white border border-border px-5 py-2.5 text-xs font-courier font-bold uppercase tracking-wider text-zinc-600 hover:border-zinc-400 transition-colors">
              <span>Filter by Date</span>
              <ChevronDown size={14} />
            </button>

            {/* Settings button */}
            <button className="p-3 bg-white border border-border text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </section>

        {/* Orders Table Rows */}
        <section className="mt-8 bg-white border border-border shadow-sm overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-border bg-[#FAF9F6] text-xs font-courier font-bold uppercase tracking-[2px] text-zinc-500">
            <div className="col-span-5">Order Details</div>
            <div className="col-span-2 text-center">SKU / Reference</div>
            <div className="col-span-2 text-center">Date Placed</div>
            <div className="col-span-1 text-center">Value</div>
            <div className="col-span-2 text-right">Status & Action</div>
          </div>

          {/* List items */}
          <div className="divide-y divide-border">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-zinc-50/50 transition-colors"
                >
                  {/* Order Details */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="h-16 w-16 bg-zinc-50 border border-border overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={order.image}
                        alt={order.collection}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="font-garamound text-xl font-bold text-zinc-950 leading-tight">
                        {order.collection}
                      </h4>
                      <p className="text-xs font-courier tracking-wide text-zinc-400 mt-1">
                        Client: {order.customerName}
                      </p>
                    </div>
                  </div>

                  {/* Reference / SKU */}
                  <div className="col-span-2 text-center text-sm font-courier text-zinc-900 font-semibold">
                    <p>{order.reference}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{order.sku}</p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-center text-sm text-zinc-500 font-sans">
                    {order.date}
                  </div>

                  {/* Value */}
                  <div className="col-span-1 text-center text-md font-semibold text-zinc-900">
                    {order.value}
                  </div>

                  {/* Status & Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-center mr-2",
                        order.status === "In Transit" && "bg-[#FAF4EB] text-[#A67C37]",
                        order.status === "Delivered" && "bg-[#EAEAEA] text-[#737373]",
                        order.status === "Pending" && "bg-amber-50 text-amber-600 border border-amber-100"
                      )}
                    >
                      {order.status}
                    </span>
                    <button className="p-2 text-zinc-400 hover:text-zinc-950 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-zinc-400 font-courier">
                NO ORDERS FOUND IN THIS TAB.
              </div>
            )}
          </div>
        </section>

        {/* Footer Bar */}
        <section className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-[#FAF9F6] border border-border px-8 py-5 gap-4">
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Total Order Count
              </p>
              <p className="text-xl font-garamound font-bold text-zinc-900 mt-1">
                148 Orders
              </p>
            </div>
            <div className="border-l border-border pl-8">
              <p className="text-[10px] font-courier tracking-[2px] uppercase text-zinc-400">
                Pending Delivery
              </p>
              <p className="text-xl font-garamound font-bold text-[#A67C37] mt-1">
                12 Orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-courier tracking-wide text-zinc-400">
              SHOWING 1-10 OF 148
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
