import { apiClient } from "@/lib/api/client";
import { ApiSuccess, PaginatedResponse } from "@/types/api.types";
import { CancelOrderDto, CreateOrderDto, GetAdminOrdersParams, GetOrdersParams, Order, UpdateOrderStatusDto, CheckoutResponse } from "@/types/order.types";

export const OrderService = {
    async create(data: CreateOrderDto) {
        const res = await apiClient.post<ApiSuccess<CheckoutResponse>>(
            "/orders",
            data
        );

        return res.data;
    },

    async getOrders(params?: GetOrdersParams) {
        const res =
            await apiClient.get<PaginatedResponse<Order[]>>(
                "/orders",
                {
                    params,
                }
            );

        return res.data;
    },

    async getAdminOrders(
        params?: GetAdminOrdersParams
    ) {
        const res =
            await apiClient.get<PaginatedResponse<Order[]>>(
                "/orders/admin/all",
                {
                    params,
                }
            );

        return res.data;
    },

    async getById(id: string) {
        const res =
            await apiClient.get<ApiSuccess<Order>>(
                `/orders/${id}`
            );

        return res.data;
    },

    async getAdminOrderById(id: string) {
        const res =
            await apiClient.get<ApiSuccess<Order>>(
                `/orders/admin/${id}`
            );

        return res.data;
    },

    async cancel(
        id: string,
        data: CancelOrderDto
    ) {
        const res =
            await apiClient.post<ApiSuccess<Order>>(
                `/orders/${id}/cancel`,
                data
            );

        return res.data;
    },

    async updateStatus(
        id: string,
        data: UpdateOrderStatusDto
    ) {
        const res =
            await apiClient.put<ApiSuccess<Order>>(
                `/orders/${id}/status`,
                data
            );

        return res.data;
    },
}