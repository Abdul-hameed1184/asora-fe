// services/product.service.ts

import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { ProductDto, CategoryDto } from "@/types/product.types";

type CategoryListData = ApiSuccess<{ data: CategoryDto[]; total: number }>;

interface ProductPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

type ProductListData = ApiSuccess<{ data: ProductDto[]; pagination: ProductPagination }>;

export const ProductService = {

    async getAll(params?: Record<string, unknown>): Promise<ProductListData> {
        const res = await apiClient.get<ProductListData>("/products", { params });
        return res.data;
    },

    async getAllPublished(params?: Record<string, unknown>): Promise<ProductListData> {
        const res = await apiClient.get<ProductListData>("/products/published", { params });
        return res.data;
    },

    async getById(id: string): Promise<ApiSuccess<ProductDto>> {
        const res = await apiClient.get<ApiSuccess<ProductDto>>(`/products/${id}`);
        return res.data;
    },

    async getPublishedById(id: string): Promise<ApiSuccess<ProductDto>> {
        const res = await apiClient.get<ApiSuccess<ProductDto>>(`/products/${id}/published`);
        return res.data;
    },

    async create(data: ProductDto): Promise<ApiSuccess<ProductDto>> {
        const res = await apiClient.post<ApiSuccess<ProductDto>>("/products", data);
        return res.data;
    },

    async update(id: string, data: Partial<ProductDto>): Promise<ApiSuccess<ProductDto>> {
        const res = await apiClient.put<ApiSuccess<ProductDto>>(`/products/${id}`, data);
        return res.data;
    },

    async delete(id: string): Promise<ApiSuccess<null>> {
        const res = await apiClient.delete<ApiSuccess<null>>(`/products/${id}`);
        return res.data;
    },

    async getCategories(): Promise<CategoryListData> {
        const res = await apiClient.get<CategoryListData>("/categories");
        return res.data;
    },

    async createCategory(data: { name: string; description?: string }): Promise<ApiSuccess<CategoryDto>> {
        const res = await apiClient.post<ApiSuccess<CategoryDto>>("/categories", data);
        return res.data;
    },

    async updateCategory(id: string, data: { name?: string; description?: string }): Promise<ApiSuccess<CategoryDto>> {
        const res = await apiClient.put<ApiSuccess<CategoryDto>>(`/categories/${id}`, data);
        return res.data;
    },

    async deleteCategory(id: string): Promise<ApiSuccess<null>> {
        const res = await apiClient.delete<ApiSuccess<null>>(`/categories/${id}`);
        return res.data;
    },
};