export const TIMEOUT = 10000; // 10 seconds

export const SWRCacheKeys = {
  SignIn: 'signIn',
  Logout: 'logout',
  RefreshToken: 'refreshToken',
  CurrentUser: 'currentUser',
} as const;

export const ApiErrorCodes = {
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
} as const;
