import { Outlet } from 'react-router';

import { SidebarProvider } from '@shared/components/ui/sidebar';

import AppSidebar from '@features/sidebar/components/app-sidebar/app-sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
