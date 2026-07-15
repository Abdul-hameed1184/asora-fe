"use client";

import { useState } from "react";
import {
    ShoppingBag,
    Package,
    Users,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    LayoutGrid,
    History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { clsx } from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const navigation = [
    {
        title: "Overview",
        href: "/admin",
        icon: LayoutGrid,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
    },
    {
        title: "Inventory",
        href: "/admin/inventory",
        icon: Package,
    },
    {
        title: "Inventory Log",
        href: "/admin/inventory-log",
        icon: History,
    },
    {
        title: "Customers",
        href: "/admin/customers",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const displayName = user ? `${user.firstName} ${user.lastName}` : "Admin";
    const displayRole = user?.role ?? "";

    function handleLogout() {
        logout();
        router.push("/login");
    }

    return (
        <aside
            className={cn(
                "flex flex-col h-screen bg-zinc-900 text-zinc-400 transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-white/[0.06] p-3",
                collapsed ? "w-14 min-w-14" : "w-[17vw]"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "flex justify-end items-center h-14 flex-shrink-0 transition-all",
                    collapsed ? "justify-center px-0" : "justify-end px-4"
                )}
            >

                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="w-7 h-7 rounded-md flex  items-center justify-center text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-100 transition-colors flex-shrink-0"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
                </button>
            </div>
            <div className="text-center">
                <h1 className="text-[36px] font-serif text-[#D5A53B] leading-none">
                    `&apos; Aṣora Clothiers
                </h1>

                <p className="mt-3 text-gray-300 text-lg">
                    Management Portal
                </p>
            </div>

            {/* Profile */}
            <div className="mt-14 flex flex-col items-center">

                <div className="h-28 w-28 rounded-full border-2 border-[#C79A35] p-1">
                    <img
                        src="/profile.jpg"
                        alt="profile"
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>

                <h2 className="mt-5 text-2xl font-serif text-[#E5C16A]">
                    {displayName}
                </h2>

                <p className="mt-1 text-[11px] tracking-[4px] uppercase text-gray-400">
                    {displayRole}
                </p>
            </div>

            <nav className="mt-14 flex-1 space-y-4">

                {navigation.map((item) => {
                    const active =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-4 rounded-full px-5 py-4 transition-all duration-300",
                                active
                                    ? "bg-[#C99A36] text-[#262626]"
                                    : "text-gray-200 hover:bg-white/5"
                            )}
                        >
                            <Icon size={22} strokeWidth={1.8} />

                            <span className="text-xl">
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-white/10">

                <button
                    onClick={handleLogout}
                    className="
            w-full
            rounded-full
            border
            border-[#C99A36]
            px-5
            py-4
            flex
            items-center
            gap-4
            text-[#E8C26A]
            transition
            hover:bg-[#C99A36]
            hover:text-black
          "
                >
                    <LogOut size={22} />

                    <span className="text-lg font-medium">
                        Sign Out
                    </span>
                </button>

            </div>
        </aside>
    );
}