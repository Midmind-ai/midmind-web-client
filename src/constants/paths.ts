export const AppRoutes = {
  Home: '/',
  SignIn: '/sign-in',
  SignUp: '/sign-up',
  ForgotPassword: '/forgot-password',
  Chat: (id: string) => `/chats/${id}`,
  ChatOld: (id: string) => `/chat-old/${id}`,
  Note: (id: string) => `/notes/${id}`,
  NotFound: '*',
} as const;

export const SearchParams = {
  Split: 'split',
} as const;
