import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { DashboardAnalytics } from "@/types/analytics.types";

export const AnalyticsService = {
    async getDashboard() {
        const res = await apiClient.get<ApiSuccess<DashboardAnalytics>>(
            "/analytics/dashboard"
        );

        return res.data;
    },
};
