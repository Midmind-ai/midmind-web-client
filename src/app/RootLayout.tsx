import { Outlet } from 'react-router';

// import { SidebarProvider } from '@shared/components/Sidebar';
// import AppSidebar from '@features/Sidebar/components/AppSidebar/AppSidebar';

import { AppSidebar as AppSidebar2 } from '@/features/sidebar-new/app-sidebar';
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
        {/* <AppSidebar /> */}
        <AppSidebar2 />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
