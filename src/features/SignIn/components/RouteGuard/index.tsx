import type { FC } from 'react';

import { Navigate, Outlet } from 'react-router';

import { AppRoutes } from '@shared/constants/router';

const RouteGuard: FC = () => {
  const isAuthenticated = true;

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

export default RouteGuard;
