export const AppRoutes = {
  Home: '/',
  SignIn: '/sign-in',
  SignUp: '/sign-up',
  ForgotPassword: '/forgot-password',
  Item: (id: string) => `/item/${id}`,
  Chat: (id: string) => `/chat/${id}`,
  ChatOld: (id: string) => `/chat-old/${id}`,
  NotFound: '*',
} as const;

export const SearchParams = {
  Split: 'split',
} as const;
