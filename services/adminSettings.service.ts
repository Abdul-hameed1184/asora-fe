import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { AdminSettings, UpdateAdminSettingsDto } from "@/types/adminSettings.types";

export class AdminSettingsService {
  static async getSettings() {
    const response = await apiClient.get<ApiSuccess<AdminSettings>>("/admin/settings");
    return response.data;
  }

  static async updateSettings(data: UpdateAdminSettingsDto) {
    const response = await apiClient.patch<ApiSuccess<AdminSettings>>("/admin/settings", data);
    return response.data;
  }
}
