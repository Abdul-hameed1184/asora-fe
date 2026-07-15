// services/inventory-log.service.ts

import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";

interface InventoryLogPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

type InventoryLogListData = ApiSuccess<{ data: unknown[]; pagination: InventoryLogPagination }>;

export const InventoryLogService = {
    async getAll(params?: Record<string, unknown>): Promise<InventoryLogListData> {
        const res = await apiClient.get<InventoryLogListData>("/inventory-logs", { params });
        return res.data;
    },
};
