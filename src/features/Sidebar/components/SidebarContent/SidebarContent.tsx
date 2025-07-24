import { Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';

import { SidebarContent as SHDCNSidebarContent } from '@shared/components/Sidebar';

import { useSidebarContentLogic } from '@/features/Sidebar/components/SidebarContent/useSidebarContentLogic';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';
import { ThemedH3 } from '@/shared/components/ThemedH3';
import { AppRoutes } from '@/shared/constants/router';

const SidebarContent = () => {
  const { chats, isLoading, isDeleting, handleDelete } = useSidebarContentLogic();

  return (
    <SHDCNSidebarContent className="p-4">
      <ThemedH3 className="font-semibold">Chats</ThemedH3>
      {isLoading ? (
        <div className="mt-2 space-y-2">
          {[...Array(4)].map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-6 w-full rounded"
            />
          ))}
        </div>
      ) : (
        chats?.map(chat => (
          <div
            key={chat.id}
            className="flex items-center w-full max-w-full truncate cursor-pointer py-1 rounded hover:bg-muted focus:bg-muted outline-none group"
          >
            <Link
              className="block flex-1 truncate"
              to={AppRoutes.Chat(chat.id)}
            >
              {chat.id}
            </Link>
            <Button
              className="ml-2 p-1 rounded hover:bg-red-100 focus:bg-red-200 focus:outline-none"
              onClick={() => handleDelete(chat.id)}
              disabled={isDeleting}
            >
              <Trash2Icon className="size-4 text-red-500" />
            </Button>
          </div>
        ))
      )}
    </SHDCNSidebarContent>
  );
};

export default SidebarContent;
