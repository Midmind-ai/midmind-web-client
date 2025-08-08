import { Navigate, Outlet } from 'react-router';

import { AppRoutes } from '@shared/constants/router';

import { useCheckAuth } from '@shared/hooks/use-check-auth';

const ProtectedRoute = () => {
  const { isLoading, isAuthenticated } = useCheckAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
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
