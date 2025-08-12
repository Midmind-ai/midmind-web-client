import { createCacheKey } from '@shared/utils/cache-selectors';

export const TIMEOUT = 10000; // 10 seconds

// New array-based cache keys for better cache management
export const SWRCacheKeys = {
  // Auth keys
  SignIn: createCacheKey('auth', 'signIn'),
  Logout: createCacheKey('auth', 'logout'),
  RefreshToken: createCacheKey('auth', 'refreshToken'),
  CurrentUser: createCacheKey('auth', 'user'),

  // Mutation keys
  CreateChat: createCacheKey('mutation', 'createChat'),
  CreateDirectory: createCacheKey('mutation', 'createDirectory'),
  UpdateChatDetails: createCacheKey('mutation', 'updateChatDetails'),
  DeleteChat: createCacheKey('mutation', 'deleteChat'),
  SendMessageToChat: (chatId: string) =>
    createCacheKey('mutation', 'sendMessage', chatId),

  // Query keys
  GetChats: createCacheKey('chats'),
  GetChatsWithParent: (parentDirectoryId?: string, parentChatId?: string) => {
    if (parentDirectoryId) {
      return createCacheKey('chats', 'directory', parentDirectoryId);
    }
    if (parentChatId) {
      return createCacheKey('chats', 'chat', parentChatId);
    }

    return createCacheKey('chats');
  },
  GetDirectories: (parentId?: string) =>
    parentId ? createCacheKey('directories', parentId) : createCacheKey('directories'),
  GetChatDetails: (id: string) => createCacheKey('chat', id),
  GetMessages: (chatId: string) => createCacheKey('messages', chatId),
  GetMessagesPaginated: (chatId: string, pageIndex: number) =>
    createCacheKey('messages', chatId, pageIndex),
} as const;

export const ApiErrorCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
} as const;
