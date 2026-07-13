import imageCompression from "browser-image-compression";
import {
  getUploadSignature,
  uploadToCloudinary,
  registerUpload,
  batchRegisterUploads,
} from "@/lib/api/upload.api";
import type {
  CloudinarySignature,
  CloudinaryUploadResponse,
  RegisterUploadInput,
  UploadedImage,
} from "@/types/upload.types";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 2000,
  useWebWorker: true,
} as const;

function toRegisterInput(data: CloudinaryUploadResponse): RegisterUploadInput {
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

function toUploadedImage(reg: {
  id: string;
  url: string;
  publicId: string;
  format: string | null;
  type: string;
}): UploadedImage {
  return {
    id: reg.id,
    url: reg.url,
    publicId: reg.publicId,
    format: reg.format ?? "",
    type: reg.type,
  };
}

export const UploadService = {
  // Fetch a fresh signature. Exposed so callers can share one across a batch.
  getSignature: (folder?: string): Promise<CloudinarySignature> =>
    getUploadSignature(folder),

  // Compress a file and upload it directly to Cloudinary using a pre-fetched
  // signature. Does NOT register in the DB — callers handle that separately
  // so a single batch can share one DB round-trip.
  async compressAndUpload(
    file: File,
    signature: CloudinarySignature,
    onProgress?: (percent: number) => void
  ): Promise<CloudinaryUploadResponse> {
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
    return uploadToCloudinary(compressed, signature, onProgress);
  },

  // Single-file upload: sign → compress → upload → register (for profile pics,
  // vendor logos, and any standalone use where per-request overhead is fine).
  async upload(
    file: File,
    onProgress?: (percent: number) => void,
    folder?: string
  ): Promise<UploadedImage> {
    const signature = await getUploadSignature(folder);
    const cloudinaryData = await UploadService.compressAndUpload(
      file,
      signature,
      onProgress
    );
    const registered = await registerUpload(toRegisterInput(cloudinaryData));
    return toUploadedImage(registered);
  },

  // Batch upload: 1 sign → N compress+upload in parallel → 1 batch register.
  // For N images: 2 backend requests instead of 2N.
  async uploadMany(
    files: File[],
    folder?: string
  ): Promise<UploadedImage[]> {
    const signature = await getUploadSignature(folder);
    const cloudinaryResults = await Promise.all(
      files.map((file) => UploadService.compressAndUpload(file, signature))
    );
    const registered = await batchRegisterUploads(
      cloudinaryResults.map(toRegisterInput)
    );
    return registered.map(toUploadedImage);
  },
};
