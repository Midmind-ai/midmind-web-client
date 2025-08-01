import { createBrowserRouter } from 'react-router';

import ChatPage from '@app/routes/Chat';
import HomePage from '@app/routes/Home';
import NotFoundPage from '@app/routes/NotFound';
import SignInPage from '@app/routes/SignIn';
import SignUpPage from '@app/routes/SignUp';

import { AppRoutes } from '@shared/constants/router';

import ProtectedRoute from '@features/SignIn/components/ProtectedRoute/ProtectedRoute';

import RootLayout from '@/app/RootLayout';
import ForgotPasswordPage from '@/app/routes/ForgotPassword';

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
