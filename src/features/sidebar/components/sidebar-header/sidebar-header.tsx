import OrganizationSwitcher from '@features/sidebar/components/organization-switcher/organization-switcher';

import { SidebarHeader as ShadcnSidebarHeader } from '@/components/ui/sidebar';

const SidebarHeader = () => {
  return (
    <ShadcnSidebarHeader className="border-b-1">
      <OrganizationSwitcher teams={[]} />
    </ShadcnSidebarHeader>
  );
};

export default SidebarHeader;
