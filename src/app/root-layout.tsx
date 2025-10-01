import { Outlet } from 'react-router';
import Sidebar from '@components/misc/sidebar/sidebar';
import { SidebarProvider } from '@components/ui/sidebar';

const RootLayout = () => {
  return (
    <div className="flex h-full max-h-full">
      <SidebarProvider>
        <Sidebar />
        <Outlet />
      </SidebarProvider>
    </div>
  );
};

export default RootLayout;
