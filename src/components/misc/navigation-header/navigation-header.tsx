import { SidebarIcon, XIcon } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@components/ui/button';
import { useSidebar } from '@components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip';
import Breadcrumbs from '@features/breadcrumbs/breadcrumbs';

type Props = {
  id: string;
  showCloseButton?: boolean;
  showSidebarToggle?: boolean;
  onClose?: VoidFunction;
};

const NavigationHeader = ({
  id,
  showCloseButton,
  showSidebarToggle = true,
  onClose,
}: Props) => {
  const { toggleSidebar } = useSidebar();

  return (
    <header
      className="flex min-h-(--navigation-header-height) items-center justify-between
        border-b pr-2.5 pl-4"
    >
      <div className="flex items-center gap-2">
        {showSidebarToggle && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={toggleSidebar}
                >
                  <SidebarIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle sidebar</TooltipContent>
            </Tooltip>
            <div className="relative h-[15px] w-0 border" />
          </>
        )}
        <Breadcrumbs id={id} />
      </div>
      <div className="flex items-center gap-2">
        {/* <Button variant="outline">
          <BoxSelectIcon />
          Map
        </Button> */}
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

export default memo(NavigationHeader);
