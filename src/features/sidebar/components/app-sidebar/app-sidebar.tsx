import { Sidebar, SidebarContent, SidebarRail } from '@shared/components/ui/sidebar';

import FoldersActions from '@features/sidebar/components/folder-actions/folder-actions';
import FolderList from '@features/sidebar/components/folder-list/folder-list';
import SidebarHeader from '@features/sidebar/components/sidebar-header/sidebar-header';
import SidebarTabs from '@features/sidebar/components/sidebar-tabs/sidebar-tabs';
import UserDropdown from '@features/sidebar/components/user-dropdown/user-dropdown';

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader />
      <div className="flex h-full">
        <div className="flex flex-col h-full border-r-1 justify-between">
          <SidebarTabs />
          <UserDropdown />
        </div>
        <SidebarContent className="gap-0">
          <FoldersActions />
          <FolderList />
        </SidebarContent>
      </div>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
