export function generateId(): string {
  return crypto.randomUUID();
}

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
