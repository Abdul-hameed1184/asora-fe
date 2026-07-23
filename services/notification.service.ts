import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import {
  Notification,
  NotificationListParams,
  NotificationListResponse,
} from "@/types/notification.types";

export class NotificationService {
  static async list(params?: NotificationListParams) {
    const response = await apiClient.get<ApiSuccess<NotificationListResponse>>(
      "/notifications",
      { params },
    );
    return response.data;
  }

  static async getUnreadCount() {
    const response = await apiClient.get<ApiSuccess<{ count: number }>>(
      "/notifications/unread-count",
    );
    return response.data;
  }

  static async getById(id: string) {
    const response = await apiClient.get<ApiSuccess<Notification>>(`/notifications/${id}`);
    return response.data;
  }

  static async markAsRead(id: string) {
    const response = await apiClient.put<ApiSuccess<Notification>>(`/notifications/${id}/read`);
    return response.data;
  }

  static async markAllAsRead() {
    const response = await apiClient.put<ApiSuccess<null>>("/notifications/read-all");
    return response.data;
  }

  static async delete(id: string) {
    const response = await apiClient.delete<ApiSuccess<null>>(`/notifications/${id}`);
    return response.data;
  }

  static async deleteAll() {
    const response = await apiClient.delete<ApiSuccess<null>>("/notifications/delete-all");
    return response.data;
  }
}
