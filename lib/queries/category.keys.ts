/**
 * lib/queries/category.keys.ts
 *
 * Typed query-key factory for the category domain, mirroring products.keys.ts.
 */

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
} as const;
