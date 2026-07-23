import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { UserSettings, UpdateUserSettingsDto } from "@/types/settings.types";

export class SettingsService {
  static async getSettings() {
    const response = await apiClient.get<ApiSuccess<UserSettings>>("/settings");
    return response.data;
  }

  static async updateSettings(data: UpdateUserSettingsDto) {
    const response = await apiClient.patch<ApiSuccess<UserSettings>>("/settings", data);
    return response.data;
  }
}
