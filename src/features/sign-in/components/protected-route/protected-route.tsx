import { Navigate, Outlet } from 'react-router';

import { AppRoutes } from '@shared/constants/router';

import { useCheckAuth } from '@shared/hooks/use-check-auth';

const ProtectedRoute = () => {
  const { isLoading, isAuthenticated } = useCheckAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-foreground h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={AppRoutes.SignIn}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
