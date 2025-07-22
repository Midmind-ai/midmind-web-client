import { Separator } from '@shared/components/Separator';
import { Sidebar } from '@shared/components/Sidebar';

import SidebarContent from '@features/Sidebar/components/SidebarContent/SidebarContent';
import SidebarFooter from '@features/Sidebar/components/SidebarFooter/SidebarFooter';
import SidebarHeader from '@features/Sidebar/components/SidebarHeader/SidebarHeader';

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader />
      <Separator />
      <SidebarContent />
      <Separator />
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
