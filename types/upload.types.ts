export interface LocalImage {
  id: string;
  file: File;
  preview: string;
}

export interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  format: string;
  type: string;
}

export type UploadStatus =
  | "idle"
  | "compressing"
  | "uploading"
  | "uploaded"
  | "failed";

export interface UploadImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: UploadStatus;
  uploaded?: UploadedImage;
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder?: string;
}

export interface CloudinaryUploadResponse {
  asset_id: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes?: number;
  original_filename?: string;
}

export interface RegisterUploadInput {
  url: string;
  publicId: string;
  type: "image" | "video";
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  originalFilename?: string;
}

export interface RegisteredUpload {
  id: string;
  url: string;
  publicId: string;
  type: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  originalFilename: string | null;
  uploadedById: string;
  createdAt: string;
}
