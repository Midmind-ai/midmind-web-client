import SidebarHeader from './components/sidebar-header/sidebar-header';
import SidebarTabs from './components/sidebar-tabs/sidebar-tabs';
import UserDropdown from './components/user-dropdown/user-dropdown';
import { Sidebar as ShadcnSidebar, SidebarContent } from '@components/ui/sidebar';
import FileSystem from '@features/file-system/file-system';

const Sidebar = () => {
  return (
    <ShadcnSidebar>
      <SidebarHeader />
      <div className="flex h-full">
        <div className="flex h-full flex-col justify-between border-r-1 border-l-1 p-1">
          <SidebarTabs />
          <UserDropdown />
        </div>
        <SidebarContent className="gap-0">
          <FileSystem />
        </SidebarContent>
      </div>
    </ShadcnSidebar>
  );
};

export default Sidebar;
