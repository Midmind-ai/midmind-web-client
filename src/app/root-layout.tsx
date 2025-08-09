import SplitLayout from '@app/split-layout';

import { SidebarProvider } from '@shared/components/ui/sidebar';

import Sidebar from '@features/sidebar/sidebar';

const RootLayout = () => {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar />
        <SplitLayout />
      </SidebarProvider>
    </div>
  );
};

export default RootLayout;
