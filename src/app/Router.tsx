import { createBrowserRouter } from 'react-router';

import ChatPage from '@app/routes/chat';
import HomePage from '@app/routes/home';
import NotFoundPage from '@app/routes/not-found';
import SignInPage from '@app/routes/sign-in';
import SignUpPage from '@app/routes/sign-up';

import { AppRoutes } from '@shared/constants/router';

import ProtectedRoute from '@features/sign-in/components/protected-route/protected-route';

import RootLayout from '@/app/root-layout';
import ForgotPasswordPage from '@/app/routes/forgot-password';

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: AppRoutes.Home,
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: AppRoutes.Chat(':id'),
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
  {
    path: AppRoutes.SignIn,
    element: <SignInPage />,
  },
  {
    path: AppRoutes.SignUp,
    element: <SignUpPage />,
  },
  {
    path: AppRoutes.ForgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: AppRoutes.NotFound,
    element: <NotFoundPage />,
  },
]);

export default router;
