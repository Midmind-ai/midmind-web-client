import { memo } from 'react';

import LLMResponse from '@/features/Chat/components/LLMResponse/LLMResponse';
import { useMessageListLogic } from '@/features/Chat/components/MessageList/useMessageListLogic';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { ScrollArea } from '@/shared/components/ScrollArea';

const MessageList = memo(() => {
  const { messages, scrollAreaRef } = useMessageListLogic();

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="flex flex-col gap-2.5">
        {messages?.data?.map(({ id, content, role }) => {
          if (role === 'user') {
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
              id={id}
              content={content}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
