import { BoxSelectIcon, XIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import Breadcrumbs from './components/breadcrumbs';

type Props = React.PropsWithChildren<{
  onClose?: VoidFunction;
}>;

export default function SectionWithHeader({ onClose, children }: Props) {
  return (
    <section className="flex h-full flex-col">
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
