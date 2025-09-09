export const AI_MODELS = {
  GEMINI_2_0_FLASH_LITE: {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    shortName: '2.0 Flash Lite',
    image: '/gemini.png',
  },
  GEMINI_2_0_FLASH: {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    shortName: '2.0 Flash',
    image: '/gemini.png',
  },
  GEMINI_2_5_FLASH: {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    shortName: '2.5 Flash',
    image: '/gemini.png',
  },
  GEMINI_2_5_PRO: {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    shortName: '2.5 Pro',
    image: '/gemini.png',
  },
} as const;

export const DEFAULT_AI_MODEL = AI_MODELS.GEMINI_2_0_FLASH_LITE.id;
