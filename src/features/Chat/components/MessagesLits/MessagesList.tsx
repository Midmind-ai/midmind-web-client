import React, { useState } from 'react';

import { useMessagesListLogic } from '@/features/Chat/components/MessagesLits/useMessagesListLogic';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { useUpdateChatDetails } from '@/features/Chat/hooks/useUpdateChatDetails';
import { ScrollArea } from '@/shared/components/ScrollArea';
import { Skeleton } from '@/shared/components/Skeleton';

const mockMessages = [
  {
    message:
      'I want to know more about micro-services architecture. Please give me rough overview. Me and my team considering it as main approach. ',
  },
];

const MessagesList = () => {
  const { chatDetails, isLoading: isChatDetailsLoading, chatId } = useMessagesListLogic();
  const { updateChatDetails, isLoading: isUpdating } = useUpdateChatDetails();
  const [editedName, setEditedName] = useState('');

  React.useEffect(() => {
    setEditedName(chatDetails?.name || 'Untitled');
  }, [chatDetails?.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleNameBlur = async () => {
    if (editedName.trim() && editedName !== (chatDetails?.name || 'Untitled') && chatId) {
      await updateChatDetails(chatId, { name: editedName });
    } else if (editedName !== (chatDetails?.name || 'Untitled')) {
      setEditedName(chatDetails?.name || 'Untitled');
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditedName(chatDetails?.name || 'Untitled');
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <>
      <div className="p-4 border-b bg-white">
        {isChatDetailsLoading ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          <>
            <input
              className="bg-transparent border-none font-semibold w-full focus:outline-none focus:border-b focus:border-blue-500 transition-colors px-0 py-0.5 text-base"
              value={editedName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              aria-label="Chat name"
              maxLength={64}
              spellCheck={false}
              disabled={isUpdating}
              style={{ minWidth: 0 }}
            />
            <div
              className="text-gray-500 text-sm mt-1 truncate"
              title={chatDetails?.description || 'No description'}
            >
              {chatDetails?.description || 'No description'}
            </div>
          </>
        )}
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {mockMessages.map(({ message }, index) => (
            <UserMessage
              key={index}
              text={message}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

export default MessagesList;
