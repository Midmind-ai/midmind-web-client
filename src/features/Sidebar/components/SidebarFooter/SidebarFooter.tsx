import {
  ChevronsUpDownIcon,
  MessageCircleQuestionMark,
  Settings2Icon,
  Trash2Icon,
} from 'lucide-react';
import { Link } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/DropdownMenu';
import { SidebarFooter as SHDCNSidebarFooter } from '@shared/components/Sidebar';

import { useSidebarFooterLogic } from '@features/Sidebar/components/SidebarFooter/useSidebarFooterLogic';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/Avatar';
import { ThemedP } from '@/shared/components/ThemedP';
import { ThemedSpan } from '@/shared/components/ThemedSpan';

const SidebarFooter = () => {
  const { avatar, first_name, last_name, email, handleLogout, isLoading } = useSidebarFooterLogic();

  return (
    <SHDCNSidebarFooter className="gap-8 p-4">
      <div className="flex flex-col gap-4 mb-0">
        <Link
          className="flex items-center gap-2 text-sm w-full"
          to="#"
        >
          <Settings2Icon className="size-4" />
          <ThemedSpan className="truncate overflow-hidden whitespace-nowrap w-full">
            Settings
          </ThemedSpan>
        </Link>
        <Link
          className="flex items-center gap-2 text-sm w-full"
          to="#"
        >
          <Trash2Icon className="size-4" />
          <ThemedSpan className="truncate overflow-hidden whitespace-nowrap w-full">
            Trash
          </ThemedSpan>
        </Link>
        <Link
          className="flex items-center gap-2 text-sm w-full"
          to="#"
        >
          <MessageCircleQuestionMark className="size-4" />
          <ThemedSpan className="truncate overflow-hidden whitespace-nowrap w-full">
            Help
          </ThemedSpan>
        </Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 w-full">
          <Avatar className="rounded-lg">
            <AvatarImage
              className="rounded-lg"
              src={avatar || ''}
            />
            <AvatarFallback className="rounded-lg bg-blue-500 text-white">
              {first_name[0] + last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="leading-none text-left flex-1 min-w-0">
            <ThemedP className="text-sm font-semibold truncate overflow-hidden whitespace-nowrap">
              {first_name} {last_name}
            </ThemedP>
            <ThemedP className="sidebar-foreground text-xs truncate overflow-hidden whitespace-nowrap">
              {email}
            </ThemedP>
          </div>
          <ChevronsUpDownIcon className="ml-auto size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoading}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SHDCNSidebarFooter>
  );
};

export default SidebarFooter;
