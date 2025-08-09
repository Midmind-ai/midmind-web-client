import type { PropsWithChildren } from 'react';

import { BoxSelectIcon, XIcon } from 'lucide-react';

import { Button } from '@shared/components/ui/button';

import Breadcrumbs from '@features/section-with-header/components/breadcrumbs';

type Props = {
  onClose?: VoidFunction;
} & PropsWithChildren;

const SectionWithHeader = ({ onClose, children }: Props) => {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b py-3 pr-2.5 pl-4">
        <Breadcrumbs />
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
