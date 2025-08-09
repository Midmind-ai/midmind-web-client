import { useNavigate } from 'react-router';

import { ThemedH1 } from '@shared/components/ui/themed-h1';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import ChatMessageForm from '@features/chat/components/chat-message-form/chat-message-form';
import { useCreateChat } from '@features/chat/hooks/use-create-chat';
import type { OnSubmitArgs } from '@features/chat/types/chat-types';

const Home = () => {
  const navigate = useNavigate();
  const { createChat } = useCreateChat();

  const handleSubmit = async (data: OnSubmitArgs) => {
    const chatId = await createChat({
      content: data.content,
      model: data.model,
      sendMessage: true,
    });

    navigate(`${AppRoutes.Chat(chatId)}?${SearchParams.Model}=${data.model}`);
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-8">
        <ThemedH1 className="text-center text-3xl font-semibold">
          What should we do next?
        </ThemedH1>
        <ChatMessageForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Home;
