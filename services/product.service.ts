// services/product.service.ts

import { apiClient } from "@/lib/api/client";
import { ApiSuccess, PaginatedResponse } from "@/types/api.types";

import { ProductDto } from "@/types/product.types";


export const ProductService = {

    async getAll(params?: Record<string, unknown>) {
        const res = await apiClient.get<PaginatedResponse<ProductDto>>(
            "/products",
            { params }
        );

        return res.data;
    },

    async getAllPublished(params?: Record<string, unknown>) {
        const res = await apiClient.get<PaginatedResponse<ProductDto>>(
            "/products/published",
            { params }
        );

        return res.data;
    },

    async getById(id: string) {
        const res = await apiClient.get<ApiSuccess<ProductDto>>(
            `/products/${id}`
        );
        return res.data;
    },

    async getPublishedById(id: string) {
        const res = await apiClient.get<ApiSuccess<ProductDto>>(
            `/products/${id}/published`
        );
        return res.data;
    },

    async create(data: ProductDto) {
        const res = await apiClient.post<ApiSuccess<ProductDto>>(
            "/products",
            data
        );
        return res.data;
    },

    async update(id: string, data: ProductDto) {
        const res = await apiClient.put<ApiSuccess<ProductDto>>(
            `/products/${id}`,
            data
        );

        return res.data;
    },

    async delete(id: string) {
        const res = await apiClient.delete<ApiSuccess<null>>(
            `/products/${id}`
        );
        return res.data;
    },

    async getCategories() {
        const res = await apiClient.get<ApiSuccess<ProductDto>>(
            "/categories"
        );
        return res.data;
    },

    async createCategory(data: ProductDto) {
        const res = await apiClient.post<ApiSuccess<ProductDto>>(
            "/categories",
            data
        );
        return res.data;
    },

    async updateCategory(id: string, data: ProductDto) {
        const res = await apiClient.put<ApiSuccess<ProductDto>>(
            `/categories/${id}`,
            data
        );
        return res.data;
    },

    async deleteCategory(id: string) {
        const res = await apiClient.delete<ApiSuccess<null>>(
            `/categories/${id}`
        );
        return res.data;
    },
};