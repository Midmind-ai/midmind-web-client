import { BoxSelectIcon, SidebarIcon, XIcon } from 'lucide-react';

import { Button } from '@components/ui/button';
import { useSidebar } from '@components/ui/sidebar';

import Breadcrumbs from '@features/navigation-header/components/breadcrumbs/breadcrumbs';

type Props = {
  showCloseButton?: boolean;
  onClose?: VoidFunction;
};

const NavigationHeader = ({ showCloseButton, onClose }: Props) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between border-b py-3 pr-2.5 pl-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <BoxSelectIcon />
          Map
        </Button>
        {showCloseButton && (
          <Button
            variant="outline"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        )}
      </div>
    </header>
  );
};

export default NavigationHeader;
