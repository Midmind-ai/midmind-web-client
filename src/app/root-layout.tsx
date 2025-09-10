import SplitLayout from '@app/split-layout';
import Sidebar from '@components/misc/sidebar/sidebar';
import { SidebarProvider } from '@components/ui/sidebar';

const RootLayout = () => {
  return (
    <div className="flex h-full max-h-full">
      <SidebarProvider>
        <Sidebar />
        <SplitLayout />
      </SidebarProvider>
    </div>
  );
};

export default RootLayout;
