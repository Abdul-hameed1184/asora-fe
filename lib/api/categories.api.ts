import { apiClient } from "@/lib/api/client";
import { Category } from "@/types/category.types";

export async function fetchCategories(): Promise<Category[]> {
  // Response shape: { data: [Category[], number] }
  const res = await apiClient.get<{ data: [Category[], number] }>("/categories");
  return res.data.data[0] ?? [];
}
