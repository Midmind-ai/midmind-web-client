import { Outlet } from 'react-router';

import { SidebarProvider } from '@shared/components/ui/sidebar';

import Sidebar from '@/features/sidebar/sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
