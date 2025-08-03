import { Trash2Icon } from 'lucide-react';
import { Link } from 'react-router';

import { SidebarContent as SHDCNSidebarContent } from '@shared/components/Sidebar';

import { useSidebarContentLogic } from '@/features/Sidebar/components/SidebarContent/useSidebarContentLogic';
import { Button } from '@/shared/components/Button';
import { Skeleton } from '@/shared/components/Skeleton';
import { ThemedH3 } from '@/shared/components/ThemedH3';
import { AppRoutes, SearchParams } from '@/shared/constants/router';

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
              to={`${AppRoutes.Chat(chat.id)}?${SearchParams.Model}=gemini-2.0-flash`}
            >
              {chat.id}
            </Link>
            <Button
              className="ml-2 p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleDelete(chat.id)}
              disabled={isDeleting}
              aria-label={`Delete chat ${chat.id}`}
              title="Delete chat"
            >
              <Trash2Icon className="size-4 text-gray-600 hover:text-red-600 transition-colors duration-200" />
            </Button>
          </div>
        ))
      )}
    </SHDCNSidebarContent>
  );
};

export default SidebarContent;
