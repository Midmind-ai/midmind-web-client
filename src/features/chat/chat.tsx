import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import MessageList from '@features/chat/components/message-list/message-list';
import NavigationHeader from '@features/navigation-header/navigation-header';

import { usePageTitle } from '@/shared/hooks/use-page-title';

import { useGetChatDetails } from './hooks/use-get-chat-details';

type Props = {
  chatId: string;
  showCloseButton?: boolean;
  onClose?: VoidFunction;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
};

const Chat = ({ chatId, showCloseButton, onClose, branchContext }: Props) => {
  const { chatDetails } = useGetChatDetails(chatId);
  usePageTitle(chatDetails?.name || '');

  return (
    <div className="flex h-screen flex-col">
      <NavigationHeader
        showCloseButton={showCloseButton}
        onClose={onClose}
      />
      <div className="flex-1 overflow-hidden">
        <MessageList chatId={chatId} />
      </div>
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
