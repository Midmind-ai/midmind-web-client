export const AppRoutes = {
  Home: '/',
  SignIn: '/sign-in',
  SignUp: '/sign-up',
  ForgotPassword: '/forgot-password',
  Chat: (id: string) => `/chats/${id}`,
  NotFound: '*',
} as const;

export const SearchParams = {
  Model: 'model',
  Split: 'split',
} as const;
