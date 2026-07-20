/**
 * hooks/useCategories.ts
 *
 * TanStack Query hook for the category domain (used to populate the
 * category dropdown in the admin product form).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { categoryKeys } from "@/lib/queries/category.keys";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  type Category,
  type CategoryListResponse,
} from "@/lib/api/category.api";

/** Categories change rarely — cache for 10 minutes */
const CATEGORY_LIST_STALE = 10 * 60_000;

export function useCategories(
  options?: Partial<UseQueryOptions<CategoryListResponse>>
) {
  return useQuery<CategoryListResponse>({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
    staleTime: CATEGORY_LIST_STALE,
    ...options,
  });
}

/** Categories are a small, low-frequency list — a plain refetch on success
 * is enough, no need for optimistic-update machinery here. */
export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation<Category, Error, { name: string; description: string }>({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();

  return useMutation<
    Category,
    Error,
    { id: string; data: { name?: string; description?: string } }
  >({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
