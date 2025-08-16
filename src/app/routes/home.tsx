import { useNavigate } from 'react-router';

import { ThemedH1 } from '@components/ui/themed-h1';

import { AppRoutes } from '@constants/paths';

import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import type { OnSubmitArgs } from '@features/chat/types/chat-types';
import { useCreateChat } from '@features/file-system/hooks/use-create-chat';

const HomePage = () => {
  const navigate = useNavigate();
  const { createChat } = useCreateChat();

  const handleSubmit = async (data: OnSubmitArgs) => {
    const chatId = await createChat({
      content: data.content,
      model: data.model,
      sendMessage: true,
    });

    navigate(AppRoutes.Chat(chatId));
  };

  return (
    <div className="h-screen">
      <div
        className="mx-auto flex h-full w-full max-w-[768px] flex-col justify-center gap-8
          p-2.5"
      >
        <ThemedH1 className="text-center text-3xl font-semibold">
          What should we do next?
        </ThemedH1>
        <ChatMessageForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default HomePage;
