export const CACHE_KEYS = {
  auth: {
    currentUser: ['auth', 'user'],
    refreshToken: ['auth', 'refreshToken'],
    signIn: ['auth', 'signIn'],
  },
  items: {
    breadcrumbsById: (itemId: string) => ['breadcrumbs', itemId],
  },
  chats: {
    root: ['chats'],
    byParentId: (parentDirectoryId?: string | null, parentChatId?: string | null) => {
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
    root: ['directories'],
    byParentId: (parentId?: string | null) =>
      parentId ? ['directories', parentId] : ['directories'],
  },
  messages: {
    byChatId: (chatId: string) => ['messages', chatId],
    byChatIdPaginated: (chatId: string, pageIndex: number) => [
      'messages',
      chatId,
      pageIndex,
    ],
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
    rename: 'mutation:renameChat',
    delete: 'mutation:deleteChat',
    move: 'mutation:moveChat',
    sendMessage: (chatId: string) => `mutation:sendMessage:${chatId}`,
  },
  directories: {
    create: 'mutation:createDirectory',
    rename: 'mutation:renameDirectory',
    move: 'mutation:moveDirectory',
    delete: 'mutation:deleteDirectory',
  },
} as const;

/**
 * Creates a filter function that matches cache keys starting with the given pattern.
 * Used with SWR's mutate() to update multiple cache entries at once.
 *
 * @example
 * findCacheKeysByPattern(['directories']) matches:
 * - ['directories'] ✅
 * - ['directories', 'abc-123'] ✅
 * - ['directories', 'xyz-456'] ✅
 * - ['chats'] ❌
 * - ['messages', 'directories'] ❌
 *
 * The mutation will run on ALL matching caches simultaneously.
 */
export const findCacheKeysByPattern = (pattern: string[]) => {
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
