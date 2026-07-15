/**
 * hooks/useCategories.ts
 *
 * TanStack Query hook for the category domain (used to populate the
 * category dropdown in the admin product form).
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { categoryKeys } from "@/lib/queries/category.keys";
import { fetchCategories, type CategoryListResponse } from "@/lib/api/category.api";

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
