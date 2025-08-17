import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import MessageList from '@features/chat/components/message-list/message-list';
import { useGetChatDetails } from '@features/chat/hooks/use-get-chat-details';
import NavigationHeader from '@features/navigation-header/navigation-header';

import { usePageTitle } from '@hooks/utils/use-page-title';

import type { ConversationWithAIRequestDto } from '@services/conversations/conversations-dtos';

type Props = {
  chatId: string;
  showCloseButton?: boolean;
  showSidebarToggle?: boolean;
  onClose?: VoidFunction;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
};

const Chat = ({
  chatId,
  showCloseButton,
  showSidebarToggle,
  onClose,
  branchContext,
}: Props) => {
  const { chatDetails } = useGetChatDetails(chatId);

  usePageTitle(chatDetails?.name || '');

  return (
    <div className="flex h-screen flex-col">
      <NavigationHeader
        id={chatId}
        showCloseButton={showCloseButton}
        showSidebarToggle={showSidebarToggle}
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
