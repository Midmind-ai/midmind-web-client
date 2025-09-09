import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from 'lucide-react';
import { useUserDropdownLogic } from './user-dropdown-logic';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { SidebarMenuButton } from '@components/ui/sidebar';
import { ThemedSpan } from '@components/ui/themed-span';

const UserDropdown = () => {
  const {
    avatar,
    email,
    first_name,
    last_name,
    isMobile,
    theme,
    handleLogout,
    setTheme,
  } = useUserDropdownLogic();

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
        <DropdownMenuLabel>Theme Appearance</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          disabled={theme === 'system'}
          onCheckedChange={() => setTheme('system')}
        >
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          disabled={theme === 'light'}
          onCheckedChange={() => setTheme('light')}
        >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          disabled={theme === 'dark'}
          onCheckedChange={() => setTheme('dark')}
        >
          Dark
        </DropdownMenuCheckboxItem>
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
