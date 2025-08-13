import { SidebarHeader as ShadcnSidebarHeader } from '@components/ui/sidebar';

import OrganizationSwitcher from '@features/sidebar/components/organization-switcher/organization-switcher';

const SidebarHeader = () => {
  return (
    <ShadcnSidebarHeader className="border-b-1">
      <OrganizationSwitcher teams={[]} />
    </ShadcnSidebarHeader>
  );
};

export default SidebarHeader;
