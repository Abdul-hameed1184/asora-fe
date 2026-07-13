"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductService } from "@/services/product.service";
import { productKeys } from "@/lib/queries/products.keys";
import type { ProductDto } from "@/types/product.types";
import type { UploadedImage } from "@/types/upload.types";

export type ProductFormData = Omit<ProductDto, "featuredImage" | "media">;

export interface CreateProductInput {
  formData: ProductFormData;
  uploadedImages: UploadedImage[];
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, uploadedImages }: CreateProductInput) => {
      const [cover, ...rest] = uploadedImages;

      const payload: ProductDto = {
        ...formData,
        featuredImage: cover?.url ?? "",
        media: uploadedImages.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          type: "image" as const,
          format: img.format,
        })),
      };

      return ProductService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
