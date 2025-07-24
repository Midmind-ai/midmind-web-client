import { Outlet } from 'react-router';

import { SidebarProvider } from '@shared/components/Sidebar';

import AppSidebar from '@features/Sidebar/components/AppSidebar/AppSidebar';

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
