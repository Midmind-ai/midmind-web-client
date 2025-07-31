export const TIMEOUT = 10000; // 10 seconds

export const SWRCacheKeys = {
  SignIn: 'signIn',
  Logout: 'logout',
  RefreshToken: 'refreshToken',
  CurrentUser: 'currentUser',
  CreateChat: 'createChat',
  GetChats: 'getChats',
  GetChatDetails: (id: string) => `getChatDetails/${id}`,
  UpdateChatDetails: 'updateChatDetails',
  DeleteChat: 'deleteChat',
  GetMessages: (chatId: string) => `getMessages/${chatId}`,
  SendMessageToChat: (chatId: string) => `sendMessageToChat/${chatId}`,
} as const;

export const ApiErrorCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
} as const;

export const LLModels = {
  Gemini20Flash: 'gemini-2.0-flash',
  Gemini20FlashLite: 'gemini-2.0-flash-lite',
  Gemini25Flash: 'gemini-2.5-flash',
  Gemini25Pro: 'gemini-2.5-pro',
} as const;
