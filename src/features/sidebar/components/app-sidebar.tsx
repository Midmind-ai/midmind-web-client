import { Sidebar, SidebarHeader, SidebarRail } from '@shared/components/ui/sidebar';

import Folders from '../folders/folders';
import { OrgSwitcher } from '../org-switcher';
import SidebarTabs from '../sidebar-tabs';
import { User } from '../user';

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="border-b-1">
        <OrgSwitcher teams={[]} />
      </SidebarHeader>
      <div className="flex h-full">
        <div className="flex flex-col h-full border-r-1 justify-between">
          <SidebarTabs />
          <User />
        </div>
        <Folders />
      </div>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
