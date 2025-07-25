import LLMResponse from '@/features/Chat/components/LLMResponse/LLMResponse';
import { useMessageListLogic } from '@/features/Chat/components/MessageList/useMessageListLogic';
import UserMessage from '@/features/Chat/components/UserMessage/UserMessage';
import { ScrollArea } from '@/shared/components/ScrollArea';

const MessageList = () => {
  const { messages } = useMessageListLogic();

  return (
    <ScrollArea className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-2.5">
        {messages?.data.map(({ content, id, role }) => {
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
};

export default MessageList;
