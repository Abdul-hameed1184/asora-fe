import { apiClient } from "@/lib/api/client";
import { ApiSuccess, PaginatedResponse } from "@/types/api.types";
import { Customer, CustomerDetail, GetAdminCustomersParams } from "@/types/customer.types";

export const CustomerService = {
    async getAdminCustomers(params?: GetAdminCustomersParams) {
        const res = await apiClient.get<PaginatedResponse<Customer[]>>(
            "/users/admin/all",
            { params }
        );

        return res.data;
    },

    async getAdminCustomerById(id: string) {
        const res = await apiClient.get<ApiSuccess<CustomerDetail>>(
            `/users/admin/${id}`
        );

        return res.data;
    },
};
