export const TIMEOUT = 10000; // 10 seconds

export const SWRCacheKeys = {
  SignIn: 'signIn',
  Logout: 'logout',
  RefreshToken: 'refreshToken',
  CurrentUser: 'currentUser',
  CreateChat: 'createChat',
  CreateDirectory: 'createDirectory',
  GetChats: 'getChats',
  GetChatsWithParent: (parentDirectoryId?: string, parentChatId?: string) => {
    if (parentDirectoryId) {
      return `getChats?parent_directory_id=${parentDirectoryId}`;
    }
    if (parentChatId) {
      return `getChats?parent_chat_id=${parentChatId}`;
    }

    return 'getChats';
  },
  GetDirectories: (parentId?: string) =>
    parentId ? `getDirectories/${parentId}` : 'getDirectories',
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
