export const CACHE_KEYS = {
  auth: {
    currentUser: ['auth', 'user'],
    refreshToken: ['auth', 'refreshToken'],
    signIn: ['auth', 'signIn'],
  },
} as const;

export const MUTATION_KEYS = {
  auth: {
    logout: 'auth:logout',
    signIn: 'auth:signIn',
    refreshToken: 'auth:refreshToken',
  },
} as const;

export const invalidateCachePattern = (pattern: string[]) => {
  return (key: unknown) => {
    if (!Array.isArray(key)) {
      return false;
    }

    return pattern.every((part, index) => {
      if (part === '*') {
        return true;
      }

      return key[index] === part;
    });
  };
};
