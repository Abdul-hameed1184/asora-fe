"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UploadService } from "@/services/upload.service";
import { batchRegisterUploads } from "@/lib/api/upload.api";
import {
  generateId,
  createPreviewUrl,
  revokePreviewUrl,
} from "@/lib/upload.utils";
import type {
  CloudinaryUploadResponse,
  RegisterUploadInput,
  UploadImage,
  UploadedImage,
} from "@/types/upload.types";

function cloudinaryToRegisterInput(
  data: CloudinaryUploadResponse
): RegisterUploadInput {
  return {
    url: data.secure_url,
    publicId: data.public_id,
    type: data.resource_type as "image" | "video",
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    originalFilename: data.original_filename,
  };
}

export function useUploadImages(folder?: string) {
  const [images, setImages] = useState<UploadImage[]>([]);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const updateImage = useCallback((id: string, patch: Partial<UploadImage>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...patch } : img))
    );
  }, []);

  const addImages = useCallback((files: File[]) => {
    const next: UploadImage[] = files.map((file) => ({
      id: generateId(),
      file,
      preview: createPreviewUrl(file),
      progress: 0,
      status: "idle",
    }));
    setImages((prev) => [...prev, ...next]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) revokePreviewUrl(target.preview);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => revokePreviewUrl(img.preview));
      return [];
    });
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (targetIds: string[] | undefined) => {
      const current = imagesRef.current;
      const toUpload = targetIds
        ? current.filter((img) => targetIds.includes(img.id))
        : current.filter(
            (img) => img.status === "idle" || img.status === "failed"
          );

      if (toUpload.length === 0) return [];

      // ONE signature shared across the entire batch.
      const signature = await UploadService.getSignature(folder);

      // Compress + upload to Cloudinary in parallel with per-image progress.
      type CloudinaryResult =
        | { img: UploadImage; data: CloudinaryUploadResponse; ok: true }
        | { img: UploadImage; ok: false };

      const cloudinaryResults: CloudinaryResult[] = await Promise.all(
        toUpload.map(async (img): Promise<CloudinaryResult> => {
          updateImage(img.id, { status: "compressing", progress: 0 });
          try {
            const data = await UploadService.compressAndUpload(
              img.file,
              signature,
              (progress) => updateImage(img.id, { status: "uploading", progress })
            );
            return { img, data, ok: true };
          } catch {
            updateImage(img.id, { status: "failed" });
            return { img, ok: false };
          }
        })
      );

      const succeeded = cloudinaryResults.filter(
        (r): r is Extract<CloudinaryResult, { ok: true }> => r.ok
      );

      if (succeeded.length === 0) return [];

      // ONE batch register request for all successful Cloudinary uploads.
      let registered;
      try {
        registered = await batchRegisterUploads(
          succeeded.map((r) => cloudinaryToRegisterInput(r.data))
        );
      } catch {
        succeeded.forEach((r) => updateImage(r.img.id, { status: "failed" }));
        return [];
      }

      // Map DB records back to their corresponding images and update state.
      const uploadedImages: UploadedImage[] = registered.map((reg, i) => ({
        id: reg.id,
        url: reg.url,
        publicId: reg.publicId,
        format: reg.format ?? succeeded[i].data.format,
        type: reg.type,
      }));

      uploadedImages.forEach((uploaded, i) => {
        updateImage(succeeded[i].img.id, {
          status: "uploaded",
          progress: 100,
          uploaded,
        });
      });

      return uploadedImages;
    },
  });

  const retryImage = useCallback(
    (id: string) => {
      uploadMutation.mutate([id]);
    },
    [uploadMutation]
  );

  const uploadedImages: UploadedImage[] = images
    .filter((img) => img.status === "uploaded" && img.uploaded)
    .map((img) => img.uploaded!);

  const uploadAsync = async (): Promise<UploadedImage[]> => {
    const result = await uploadMutation.mutateAsync(undefined);
    return result ?? [];
  };

  return {
    images,
    uploadedImages,
    addImages,
    removeImage,
    clearAll,
    retryImage,
    upload: () => uploadMutation.mutate(undefined),
    uploadAsync,
    isUploading: uploadMutation.isPending,
  };
}
