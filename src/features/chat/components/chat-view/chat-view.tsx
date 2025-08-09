import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import ChatHeader from '@features/chat/components/chat-header/chat-header';
import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import MessageList from '@features/chat/components/message-list/message-list';

type Props = {
  chatId: string;
  showCloseButton?: boolean;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
};

const ChatView = ({ chatId, branchContext, showCloseButton = false }: Props) => {
  return (
    <div className="h-screen overflow-y-auto">
      <ChatHeader showCloseButton={showCloseButton} />
      <div className="mx-auto flex h-full w-full max-w-[768px] flex-1 flex-col">
        <MessageList chatId={chatId} />
        <div className="bg-background sticky bottom-0 pb-3">
          <ChatMessageForm
            chatId={chatId}
            branchContext={branchContext}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatView;
