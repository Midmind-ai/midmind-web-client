import { Folders, Home, Search } from 'lucide-react';
import { SidebarContent, SidebarMenuButton } from '@components/ui/sidebar';

const SidebarTabs = () => {
  return (
    <SidebarContent className="flex-none flex-col gap-1 p-1.5">
      <SidebarMenuButton className="size-10 cursor-pointer justify-center">
        <Home className="size-5.5! stroke-[1.5px]" />
      </SidebarMenuButton>
      <SidebarMenuButton className="size-10 cursor-pointer justify-center">
        <Search className="size-5.5! stroke-[1.5px]" />
      </SidebarMenuButton>
      <SidebarMenuButton
        className={'size-10 justify-center'}
        isActive
      >
        <Folders className="size-5.5! stroke-[1.5px]" />
      </SidebarMenuButton>
    </SidebarContent>
  );
};

export default SidebarTabs;
