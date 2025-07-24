export const AppRoutes = {
  Home: '/',
  SignIn: '/sign-in',
  SignUp: '/sign-up',
  ForgotPassword: '/forgot-password',
  Chat: (id: string) => `/chats/${id}`,
} as const;
