import { Folders, Home, Search } from 'lucide-react';

import { SidebarContent, SidebarMenuButton } from '@shared/components/ui/sidebar';

const SidebarTabs = () => {
  return (
    <SidebarContent className="flex-none flex-col gap-1 p-1.5">
      <SidebarMenuButton className="h-10! w-10! cursor-pointer">
        <Home className="size-5.5! stroke-[1.5px]" />
      </SidebarMenuButton>
      <SidebarMenuButton className="h-10! w-10! cursor-pointer">
        <Search className="size-5.5! stroke-[1.5px]" />
      </SidebarMenuButton>
      <SidebarMenuButton
        className={'h-10! w-10!'}
        isActive
      >
        <Folders className="size-5.5! stroke-[1.5px]" />
      </SidebarMenuButton>
    </SidebarContent>
  );
};

export default SidebarTabs;
