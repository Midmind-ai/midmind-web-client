export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type SupportedFileFormat = (typeof SUPPORTED_FORMATS)[number];
