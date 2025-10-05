import { createBrowserRouter } from 'react-router';
import { ItemRouter } from '../features/item-router/item-router';
import RootLayout from '@app/root-layout';
import ForgotPasswordPage from '@app/routes/forgot-password';
import HomePage from '@app/routes/home';
import NotFoundPage from '@app/routes/not-found';
import SignInPage from '@app/routes/sign-in';
import SignUpPage from '@app/routes/sign-up';
import SplitLayout from '@app/split-layout';
import { AppRoutes } from '@constants/paths';
import ProtectedRoute from '@features/sign-in/components/protected-route/protected-route';

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: AppRoutes.Home,
        element: <RootLayout />,
        children: [
          {
            element: <SplitLayout />,
            children: [
              {
                index: true,
                element: <HomePage />,
              },
              {
                path: AppRoutes.Item(':id'),
                element: <ItemRouter />,
              },
            ],
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
