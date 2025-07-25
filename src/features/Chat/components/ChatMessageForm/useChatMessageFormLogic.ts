import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';

import { useSendMessageToChat } from '@/features/Chat/hooks/useSendMessageToChat';
import { LLModels } from '@/shared/constants/api';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';

type ChatMessageFormData = {
  message: string;
};

export const useChatMessageFormLogic = () => {
  const { id: chatId } = useParams();
  const { value: currentModel, setValue: setModel } = useUrlParams(SearchParams.Model, {
    defaultValue: LLModels.Gemini20Flash,
  });
  const { register, handleSubmit, watch, reset } = useForm<ChatMessageFormData>({
    defaultValues: {
      message: '',
    },
  });
  const { sendMessage, isLoading, error } = useSendMessageToChat(chatId || '');

  const messageValue = watch('message');

  const handleModelChange = (newModel: string) => setModel(newModel);

  const handleFormSubmit = (data: ChatMessageFormData) => {
    sendMessage({
      content: data.message,
      model: currentModel,
    });

    reset();
  };

  return {
    register,
    handleSubmit,
    handleFormSubmit,
    handleModelChange,
    currentModel,
    isValidMessage: !!messageValue?.trim().length,
    isLoading,
    error,
  };
};
