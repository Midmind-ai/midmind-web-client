// Supported image formats for file uploads
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export type SupportedImageFormat = (typeof SUPPORTED_FORMATS)[number];
