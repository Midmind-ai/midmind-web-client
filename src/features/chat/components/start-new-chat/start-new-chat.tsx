import { createChatSendMessageAndNavigate } from '../../../../actions/chat.actions';
import { ThemedH1 } from '@components/ui/themed-h1';
import ChatInput from '@features/chat/components/chat-input/chat-input';
import type { AIModel, ChatMessage } from '@shared-types/entities';
import { cn } from '@utils/cn';

const StartNewChat = () => {
  const handleFormSubmit = async (
    content: string,
    model: AIModel,
    attachments?: ChatMessage['attachments'],
    attachmentFiles?: File[]
  ) => {
    await createChatSendMessageAndNavigate({
      content,
      model,
      attachments,
      attachmentFiles,
    });
  };

  return (
    <div className={cn('h-screen')}>
      <div
        className="mx-auto flex h-full w-full max-w-[768px] flex-col justify-center gap-8
          p-2.5"
      >
        <ThemedH1 className="text-center text-3xl font-semibold">
          What should we do next?
        </ThemedH1>

        <ChatInput
          onSubmit={handleFormSubmit}
          placeholder={'Write a message...'}
        />
      </div>
    </div>
  );
};

export default StartNewChat;
