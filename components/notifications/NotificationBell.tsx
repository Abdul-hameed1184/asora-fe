"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCheck, Inbox, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification.types";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Bell icon + live unread badge + an animated dropdown card listing recent
 * notifications. One shared implementation used in both the customer navbar
 * and every admin page header — same API, same component, no duplication.
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data, isPending, isError } = useNotifications({ limit: 20 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications = data?.data ?? [];
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleItemClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id);

    // Only navigate for the one deep-link we're confident exists on the
    // customer side — admin has no confirmed per-order detail route, so we
    // just mark-as-read there rather than guess a URL.
    if (!isAdmin && notification.type === "ORDER" && notification.referenceId) {
      setIsOpen(false);
      router.push(`/orders/${notification.referenceId}`);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-700"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#C99A36] text-white text-[9px] font-bold leading-none">
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Transparent backdrop — closes the dropdown on outside click,
          reusing the codebase's existing backdrop+stopPropagation convention. */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute right-0 top-full mt-2 w-[360px] max-w-[90vw] bg-[#FAF7F2] border border-border shadow-2xl z-50 origin-top-right transition-all duration-200 ease-out",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white">
          <h3 className="font-garamound text-base font-bold text-zinc-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={markingAll}
              className="flex items-center gap-1 text-[10px] font-courier font-bold uppercase tracking-wider text-[#C99A36] hover:text-[#B0852E] transition-colors disabled:opacity-50"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
        </div>

        <div className="h-[420px] overflow-y-auto divide-y divide-border">
          {isPending && (
            <div className="p-5 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-zinc-200 rounded w-1/3" />
                  <div className="h-3 bg-zinc-200 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="p-5 text-xs font-courier text-[#C23A3A]">
              Could not load notifications.
            </p>
          )}

          {!isPending && !isError && notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 px-5 text-center">
              <Inbox size={22} className="text-zinc-300" />
              <p className="text-xs font-courier text-zinc-400">No notifications yet.</p>
            </div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "relative group hover:bg-white transition-colors",
                !notification.isRead && "bg-[#FBF4E3]"
              )}
            >
              <button
                type="button"
                onClick={() => handleItemClick(notification)}
                className="w-full text-left px-5 py-4 pr-10"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">{notification.title}</p>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#C99A36] mt-1.5 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{notification.message}</p>
                <p className="text-[10px] font-courier text-zinc-400 mt-2">
                  {timeAgo(notification.createdAt)}
                </p>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                aria-label="Delete notification"
                className="absolute top-4 right-4 p-1 text-zinc-300 hover:text-[#C23A3A] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationBell;
