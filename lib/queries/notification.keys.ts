/**
 * lib/queries/notification.keys.ts
 *
 * Typed query-key factory for the notification domain, mirroring coupon.keys.ts.
 */

import type { NotificationListParams } from "@/types/notification.types";

export const notificationKeys = {
  all: ["notifications"] as const,

  lists: () => [...notificationKeys.all, "list"] as const,

  list: (params: NotificationListParams) => [...notificationKeys.lists(), params] as const,

  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
} as const;
