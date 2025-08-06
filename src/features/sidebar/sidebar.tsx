import * as React from 'react';

import { Sidebar, SidebarHeader, SidebarRail } from '@shared/components/ui/sidebar';

import Folders from './folders/folders';
import { OrgSwitcher } from './org-switcher';
import SidebarTabs from './sidebar-tabs';
import { User } from './user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b-1">
        <OrgSwitcher teams={[]} />
      </SidebarHeader>
      <div className="flex h-full ">
        <div className="flex flex-col h-full border-r-1 justify-between">
          <SidebarTabs />
          <User />
        </div>
        <Folders />
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
