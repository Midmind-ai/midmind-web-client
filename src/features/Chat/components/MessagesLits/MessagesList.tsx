import LLMResponse from '@/features/Chat/components/LLMResponse/LLMResponse';
import { useMessagesListLogic } from '@/features/Chat/components/MessagesLits/useMessagesListLogic';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { ScrollArea } from '@/shared/components/ScrollArea';
import { Skeleton } from '@/shared/components/Skeleton';
import { ThemedP } from '@/shared/components/ThemedP';

const MessagesList = () => {
  const { chatDetails, isChatDetailsLoading, messages } = useMessagesListLogic();

  return (
    <>
      <div className="p-4 border-b bg-white">
        {isChatDetailsLoading ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          <div>
            <ThemedP className="text-sm font-semibold">Chat ID: {chatDetails?.id}</ThemedP>
            <ThemedP className="text-sm font-semibold">
              Chat Name: {chatDetails?.name || 'Untitled'}
            </ThemedP>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {messages?.data.map(({ content, id, user_id }) => {
            if (user_id) {
              return (
                <UserMessage
                  key={id}
                  text={content}
                />
              );
            }

            return (
              <LLMResponse
                key={id}
                content={content}
              />
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
};

export default MessagesList;
