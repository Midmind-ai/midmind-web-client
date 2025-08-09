import { BoxSelectIcon, SidebarIcon, XIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { useSidebar } from '@/shared/components/ui/sidebar';

import Breadcrumbs from './components/breadcrumbs';

type Props = React.PropsWithChildren<{
  onClose?: VoidFunction;
}>;

export default function SectionWithHeader({ onClose, children }: Props) {
  const { toggleSidebar } = useSidebar();

  return (
    <section className="flex h-full flex-col">
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
              className=""
            >
              <XIcon />
            </Button>
          )}
        </div>
      </header>
      <div className="flex h-full flex-col">{children}</div>
    </section>
  );
}
