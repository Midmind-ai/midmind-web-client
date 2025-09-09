import SplitLayout from '@app/split-layout';
import Sidebar from '@components/misc/sidebar/sidebar';
import { SidebarProvider } from '@components/ui/sidebar';

const RootLayout = () => {
  return (
    <div className="flex">
      <SidebarProvider>
        <Sidebar />
        <SplitLayout />
      </SidebarProvider>
    </div>
  );
};

export default RootLayout;
