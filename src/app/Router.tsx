import { createBrowserRouter } from 'react-router';

import Auth from '@/app/routes/Auth';
import Home from '@/app/routes/Home';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/auth',
    Component: Auth,
  },
]);

export default router;
