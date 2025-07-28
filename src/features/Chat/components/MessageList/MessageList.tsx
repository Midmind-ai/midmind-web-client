import { memo } from 'react';

import LLMResponse from '@/features/Chat/components/LLMResponse/LLMResponse';
import { useMessageListLogic } from '@/features/Chat/components/MessageList/useMessageListLogic';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { Button } from '@/shared/components/Button';
import { ScrollArea } from '@/shared/components/ScrollArea';

const MessageList = memo(() => {
  const {
    messages,
    scrollAreaRef,
    hasMore,
    isValidating,
    handleLoadMore,
    // handleScroll
  } = useMessageListLogic();

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="flex-1 overflow-y-auto"
      // onScroll={handleScroll}
    >
      <div className="flex flex-col gap-2.5">
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              onClick={handleLoadMore}
              disabled={isValidating}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {isValidating ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}

        {messages?.map(({ id, content, role }) => {
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
