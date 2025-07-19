export const TIMEOUT = 10000; // 10 seconds

export const ApiEndpoints = {
  SignIn: '/sign-in',
  Logout: '/logout',
  RefreshToken: '/refresh',
  CurrentUser: '/users/current',
} as const;
