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
} as const;

export const ApiErrorCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
} as const;
