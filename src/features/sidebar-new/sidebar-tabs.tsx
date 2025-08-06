import { Folders, Home, Search } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { SidebarContent } from '@/shared/components/ui/sidebar';

export default function SidebarTabs() {
  return (
    <SidebarContent className="flex-none border-r-1 flex-col p-1.5 gap-1">
      <Button
        variant={'ghost'}
        size={'icon'}
        className="w-10! h-10!"
      >
        <Home className="size-5.5!" />
      </Button>
      <Button
        variant={'ghost'}
        size={'icon'}
        className="w-10! h-10!"
      >
        <Search className="size-5.5!" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="w-10! h-10! bg-gray-200"
      >
        <Folders className="size-5.5!" />
      </Button>
    </SidebarContent>
  );
}
