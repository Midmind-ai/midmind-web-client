import { createBrowserRouter } from 'react-router';

import { AppRoutes } from '@shared/constants/router';

import ProtectedRoute from '@features/SignIn/components/ProtectedRoute';

import ForgotPasswordPage from '@/app/routes/ForgotPassword';
import HomePage from '@/app/routes/Home';
import SignInPage from '@/app/routes/SignIn';
import SignUpPage from '@/app/routes/SignUp';

const router = createBrowserRouter([
  {
    path: AppRoutes.Home,
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <HomePage />,
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
]);

export default router;
