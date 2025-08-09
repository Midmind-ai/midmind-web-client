import type { PropsWithChildren } from 'react';

import { BoxSelectIcon, SidebarIcon, XIcon } from 'lucide-react';

import { Button } from '@shared/components/ui/button';
import { useSidebar } from '@shared/components/ui/sidebar';

import Breadcrumbs from '@features/section-with-header/components/breadcrumbs';

type Props = {
  onClose?: VoidFunction;
} & PropsWithChildren;

const SectionWithHeader = ({ onClose, children }: Props) => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex h-full flex-col">
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
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
            >
              <XIcon />
            </Button>
          )}
        </div>
      </header>
      {children}
    </div>
  );
};

export default SectionWithHeader;
