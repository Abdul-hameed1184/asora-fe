import { apiClient } from "@/lib/api/client";
import { ApiSuccess } from "@/types/api.types";
import { Category } from "@/types/category.types";

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiSuccess<{ data: Category[]; total: number }>>(
    "/categories"
  );
  return res.data.data.data ?? [];
}
