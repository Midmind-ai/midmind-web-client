import { type FC } from 'react';
import { RouterProvider } from 'react-router';

import router from '@/app/Router';

const Provider: FC = () => {
  return <RouterProvider router={router} />;
};

export default Provider;
