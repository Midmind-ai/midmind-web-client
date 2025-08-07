import { Folders, Home, Search } from 'lucide-react';

import { SidebarContent, SidebarMenuButton } from '@/shared/components/ui/sidebar';

export default function SidebarTabs() {
  return (
    <SidebarContent className="flex-none flex-col p-1.5 gap-1">
      <SidebarMenuButton className="cursor-pointer w-10! h-10!">
        <Home className="size-5.5!" />
      </SidebarMenuButton>
      <SidebarMenuButton className="cursor-pointer w-10! h-10!">
        <Search className="size-5.5!" />
      </SidebarMenuButton>
      <SidebarMenuButton
        className={'w-10! h-10!'}
        isActive
      >
        <Folders className="size-5.5!" />
      </SidebarMenuButton>
    </SidebarContent>
  );
}
