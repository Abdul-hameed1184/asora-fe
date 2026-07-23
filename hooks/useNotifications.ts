/**
 * hooks/useNotifications.ts
 *
 * TanStack Query hooks for the notification domain — used by the shared
 * NotificationBell component in both the customer navbar and admin pages.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/lib/queries/notification.keys";
import { NotificationService } from "@/services/notification.service";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { Notification, NotificationListParams, NotificationListResponse } from "@/types/notification.types";

/** No websockets/SSE in this stack — polling is the only way to keep the badge live. */
const UNREAD_COUNT_POLL_INTERVAL = 30_000;

function useIsAuthReady() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const user = useAuthStore((s) => s.user);
  return hasHydrated && !!user;
}

export function useNotifications(params: NotificationListParams = {}) {
  const enabled = useIsAuthReady();

  return useQuery<NotificationListResponse>({
    queryKey: notificationKeys.list(params),
    queryFn: () => NotificationService.list(params).then((res) => res.data),
    enabled,
  });
}

export function useUnreadCount() {
  const enabled = useIsAuthReady();

  return useQuery<number>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => NotificationService.getUnreadCount().then((res) => res.data.count),
    enabled,
    refetchInterval: UNREAD_COUNT_POLL_INTERVAL,
  });
}

function useInvalidateNotifications() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: notificationKeys.lists() });
    qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
  };
}

export function useMarkAsRead() {
  const invalidate = useInvalidateNotifications();

  return useMutation<Notification, Error, string>({
    mutationFn: (id) => NotificationService.markAsRead(id).then((res) => res.data),
    onSuccess: invalidate,
  });
}

export function useMarkAllAsRead() {
  const invalidate = useInvalidateNotifications();

  return useMutation<null, Error, void>({
    mutationFn: () => NotificationService.markAllAsRead().then((res) => res.data),
    onSuccess: invalidate,
  });
}

export function useDeleteNotification() {
  const invalidate = useInvalidateNotifications();

  return useMutation<null, Error, string>({
    mutationFn: (id) => NotificationService.delete(id).then((res) => res.data),
    onSuccess: invalidate,
  });
}

export function useDeleteAllNotifications() {
  const invalidate = useInvalidateNotifications();

  return useMutation<null, Error, void>({
    mutationFn: () => NotificationService.deleteAll().then((res) => res.data),
    onSuccess: invalidate,
  });
}
