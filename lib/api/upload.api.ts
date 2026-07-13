import axios from "axios";
import { apiClient } from "./client";
import type {
  CloudinarySignature,
  CloudinaryUploadResponse,
  RegisterUploadInput,
  RegisteredUpload,
} from "@/types/upload.types";
import type { ApiSuccess } from "@/types/api.types";

export async function getUploadSignature(
  folder?: string
): Promise<CloudinarySignature> {
  const res = await apiClient.post<ApiSuccess<CloudinarySignature>>(
    "/uploads/sign",
    { folder }
  );
  return res.data.data;
}

export async function uploadToCloudinary(
  file: File,
  signature: CloudinarySignature,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  if (signature.folder) {
    formData.append("folder", signature.folder);
  }

  const res = await axios.post<CloudinaryUploadResponse>(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    formData,
    {
      onUploadProgress(event) {
        if (event.total) {
          onProgress?.(Math.round((event.loaded * 100) / event.total));
        }
      },
    }
  );

  return res.data;
}

export async function registerUpload(
  input: RegisterUploadInput
): Promise<RegisteredUpload> {
  const res = await apiClient.post<ApiSuccess<RegisteredUpload>>(
    "/uploads/register",
    input
  );
  return res.data.data;
}

export async function batchRegisterUploads(
  uploads: RegisterUploadInput[]
): Promise<RegisteredUpload[]> {
  const res = await apiClient.post<ApiSuccess<RegisteredUpload[]>>(
    "/uploads/register/batch",
    { uploads }
  );
  return res.data.data;
}
