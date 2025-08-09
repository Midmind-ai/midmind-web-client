import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarRail,
} from '@shared/components/ui/sidebar';

import FoldersActions from '@features/sidebar/components/folder-actions/folder-actions';
import FolderList from '@features/sidebar/components/folder-list/folder-list';
import SidebarHeader from '@features/sidebar/components/sidebar-header/sidebar-header';
import SidebarTabs from '@features/sidebar/components/sidebar-tabs/sidebar-tabs';
import UserDropdown from '@features/sidebar/components/user-dropdown/user-dropdown';

const Sidebar = () => {
  return (
    <ShadcnSidebar>
      <SidebarHeader />
      <div className="flex h-full">
        <div className="flex h-full flex-col justify-between border-r-1">
          <SidebarTabs />
          <UserDropdown />
        </div>
        <SidebarContent className="gap-0">
          <FoldersActions />
          <FolderList />
        </SidebarContent>
      </div>
      <SidebarRail />
    </ShadcnSidebar>
  );
};

export default Sidebar;
