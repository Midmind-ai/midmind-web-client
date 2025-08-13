export type CacheKey = readonly (string | number | boolean | null | undefined)[];

type Pattern = (string | number | boolean | null | undefined | '*')[];

/**
 * Creates a cache key array from segments.
 * Provides consistent typing and structure for SWR cache keys.
 *
 * @example
 * const chatKey = createCacheKey('chats', 'directory', directoryId);
 * const messageKey = createCacheKey('messages', chatId, pageIndex);
 */
export const createCacheKey = <
  T extends readonly (string | number | boolean | null | undefined)[],
>(
  ...segments: T
): T => {
  return segments;
};

/**
 * Creates a cache key selector function that matches keys based on a pattern.
 * Use '*' as a wildcard to match any value at that position.
 *
 * @example
 * const allChats = createCacheSelector('chats');
 * const directoryChats = createCacheSelector('chats', 'directory', '*');
 * const specificChat = createCacheSelector('chat', chatId);
 */
export const createCacheSelector = (...pattern: Pattern) => {
  return (key: unknown): boolean => {
    if (!Array.isArray(key)) {
      return false;
    }
    if (pattern.length > key.length) {
      return false;
    }

    return pattern.every((segment, index) => segment === '*' || segment === key[index]);
  };
};

/**
 * Cache key matchers for common patterns
 */
export const CacheSelectors = {
  // Auth selectors
  allAuth: createCacheSelector('auth'),
  currentUser: createCacheSelector('auth', 'user'),

  // Chat selectors
  allChats: createCacheSelector('chats'),
  rootChats: (key: unknown) =>
    Array.isArray(key) && key.length === 1 && key[0] === 'chats',
  directoryChats: createCacheSelector('chats', 'directory', '*'),
  specificDirectoryChats: (directoryId: string) =>
    createCacheSelector('chats', 'directory', directoryId),
  branchChats: createCacheSelector('chats', 'chat', '*'),
  specificBranchChats: (chatId: string) => createCacheSelector('chats', 'chat', chatId),

  // Chat details selectors
  allChatDetails: createCacheSelector('chat', '*'),
  specificChatDetails: (chatId: string) => createCacheSelector('chat', chatId),

  // Message selectors
  allMessages: createCacheSelector('messages', '*'),
  chatMessages: (chatId: string) => createCacheSelector('messages', chatId, '*'),
  specificMessagePage: (chatId: string, pageIndex: number) =>
    createCacheSelector('messages', chatId, pageIndex),

  // Directory selectors
  allDirectories: createCacheSelector('directories'),
  rootDirectories: (key: unknown) =>
    Array.isArray(key) && key.length === 1 && key[0] === 'directories',
  subDirectories: createCacheSelector('directories', '*'),
  specificDirectoryChildren: (parentId: string) =>
    createCacheSelector('directories', parentId),
} as const;

/**
 * Type guard to check if a key is a cache key array
 */
export const isCacheKey = (key: unknown): key is CacheKey => {
  return (
    Array.isArray(key) &&
    key.every(segment => {
      const type = typeof segment;

      return (
        type === 'string' ||
        type === 'number' ||
        type === 'boolean' ||
        segment === null ||
        segment === undefined
      );
    })
  );
};
