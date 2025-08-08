import { useNavigate } from 'react-router';

import { ThemedH1 } from '@shared/components/ui/themed-h1';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import ChatMessageForm from '@/features/chat/components/chat-message-form/chat-message-form';
import { useCreateChat } from '@/features/chat/hooks/use-create-chat';
import type { OnSubmitArgs } from '@/features/chat/types/chat-types';

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
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col gap-8 max-w-[768px] mx-auto w-full">
        <ThemedH1 className="text-center text-3xl font-semibold">What should we do next?</ThemedH1>
        <ChatMessageForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Home;
