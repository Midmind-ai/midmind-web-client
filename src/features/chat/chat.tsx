import { ScrollArea } from '@shared/components/ui/scroll-area';

import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import MessageList from '@features/chat/components/message-list/message-list';

type Props = {
  chatId: string;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
};

const Chat = ({ chatId, branchContext }: Props) => {
  return (
    <div className="flex h-screen flex-col">
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-[768px]">
          <MessageList chatId={chatId} />
        </div>
      </ScrollArea>
      <div className="mx-auto w-full max-w-[768px] pb-3">
        <ChatMessageForm
          chatId={chatId}
          branchContext={branchContext}
        />
      </div>
    </div>
  );
};

export default Chat;
