import { Outlet } from 'react-router';

import AppSidebar from '@/features/sidebar/components/app-sidebar';
import { SidebarProvider } from '@/shared/components/ui/sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen">
      <SidebarProvider
        style={
          {
            '--sidebar-width': '22rem',
            '--sidebar-width-mobile': '20rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
