import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@shared/components/ui/sidebar';
import { ThemedSpan } from '@shared/components/ui/themed-span';

import { useUserDropdownLogic } from '@features/sidebar/components/user-dropdown/user-dropdown-logic';

const UserDropdown = () => {
  const { avatar, email, first_name, last_name, isMobile, handleLogout } =
    useUserDropdownLogic();

  const nameAbbreviation = `${first_name[0]}${last_name[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent
            data-[state=open]:text-sidebar-accent-foreground justify-center"
        >
          <Avatar className="size-9 rounded-lg">
            <AvatarImage
              src={avatar || ''}
              alt={`${first_name} ${last_name}`}
            />
            <AvatarFallback className="rounded-lg">{nameAbbreviation}</AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={avatar || ''}
                alt={nameAbbreviation}
              />
              <AvatarFallback className="rounded-lg">{nameAbbreviation}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <ThemedSpan className="truncate font-medium">
                {first_name} {last_name}
              </ThemedSpan>
              <ThemedSpan className="truncate text-xs">{email}</ThemedSpan>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
