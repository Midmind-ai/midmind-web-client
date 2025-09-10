import SidebarHeader from './components/sidebar-header/sidebar-header';
import SidebarTabs from './components/sidebar-tabs/sidebar-tabs';
import UserDropdown from './components/user-dropdown/user-dropdown';
import { Sidebar as ShadcnSidebar, SidebarContent } from '@components/ui/sidebar';
import FileSystem from '@features/file-system/file-system';

const Sidebar = () => {
  return (
    <ShadcnSidebar>
      <SidebarHeader />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-col justify-between border-r-1 border-l-1 p-1">
          <div className="min-h-0 flex-1 overflow-auto">
            <SidebarTabs />
          </div>
          <UserDropdown />
        </div>
        <SidebarContent className="min-h-0 flex-1 gap-0">
          <FileSystem />
        </SidebarContent>
      </div>
    </ShadcnSidebar>
  );
};

export default Sidebar;
