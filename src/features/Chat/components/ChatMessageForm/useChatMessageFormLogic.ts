import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useSendMessageToChat } from '@/features/Chat/hooks/useSendMessageToChat';

interface ChatMessageFormData {
  message: string;
}

export const useChatMessageFormLogic = () => {
  const { id: chatId } = useParams();
  const { register, handleSubmit, watch, reset } = useForm<ChatMessageFormData>({
    defaultValues: {
      message: '',
    },
  });
  const { sendMessage, isLoading, error } = useSendMessageToChat(chatId || '');

  const messageValue = watch('message');

  const handleFormSubmit = (data: ChatMessageFormData) => {
    sendMessage({
      content: data.message,
      model: 'gemini-2.0-flash',
      parent_message_id: 'ce349c6f-ecd1-47c2-ac14-8e6b601a979c',
    });
    reset();
  };

  return {
    register,
    handleSubmit,
    handleFormSubmit,
    isValidMessage: !!messageValue?.trim().length,
    isLoading,
    error,
  };
};
