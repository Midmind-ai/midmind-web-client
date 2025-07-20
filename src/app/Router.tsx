import { createBrowserRouter } from 'react-router';

import HomePage from '@app/routes/Home/Home';
import SignInPage from '@app/routes/SignIn/SignIn';
import SignUpPage from '@app/routes/SignUp/SignUp';

import { AppRoutes } from '@shared/constants/router';

import ProtectedRoute from '@features/SignIn/components/ProtectedRoute/ProtectedRoute';

import ForgotPasswordPage from '@/app/routes/ForgotPassword/ForgotPassword';

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
