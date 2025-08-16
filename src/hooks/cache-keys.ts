export const CACHE_KEYS = {
  auth: {
    currentUser: ['auth', 'user'],
    refreshToken: ['auth', 'refreshToken'],
    signIn: ['auth', 'signIn'],
  },
  chats: {
    all: ['chats'],
    withParent: (parentDirectoryId?: string, parentChatId?: string) => {
      if (parentDirectoryId) {
        return ['chats', 'directory', parentDirectoryId];
      }
      if (parentChatId) {
        return ['chats', 'chat', parentChatId];
      }

      return ['chats'];
    },
    details: (id: string) => ['chat', id],
    breadcrumbs: (id: string) => ['breadcrumbs', id],
  },
  directories: {
    all: ['directories'],
    withParent: (parentId?: string) =>
      parentId ? ['directories', parentId] : ['directories'],
  },
  messages: {
    chat: (chatId: string) => ['messages', chatId],
    paginated: (chatId: string, pageIndex: number) => ['messages', chatId, pageIndex],
  },
} as const;

export const MUTATION_KEYS = {
  auth: {
    logout: 'auth:logout',
    signIn: 'auth:signIn',
    refreshToken: 'auth:refreshToken',
  },
  chats: {
    create: 'mutation:createChat',
    updateDetails: 'mutation:updateChatDetails',
    delete: 'mutation:deleteChat',
    move: 'mutation:moveChat',
    sendMessage: (chatId: string) => `mutation:sendMessage:${chatId}`,
  },
  directories: {
    create: 'mutation:createDirectory',
    move: 'mutation:moveDirectory',
  },
} as const;

/**
 * Creates a filter function that matches cache keys starting with the given pattern.
 * Used with SWR's mutate() to update multiple cache entries at once.
 *
 * @example
 * invalidateCachePattern(['directories']) matches:
 * - ['directories'] ✅
 * - ['directories', 'abc-123'] ✅
 * - ['directories', 'xyz-456'] ✅
 * - ['chats'] ❌
 * - ['messages', 'directories'] ❌
 *
 * The mutation will run on ALL matching caches simultaneously.
 */
export const invalidateCachePattern = (pattern: string[]) => {
  return (key: unknown) => {
    if (!Array.isArray(key)) {
      return false;
    }

    // Check if the key starts with the pattern
    return pattern.every((part, index) => {
      if (part === '*') {
        return true; // Wildcard matches anything
      }

      return key[index] === part;
    });
  };
};
