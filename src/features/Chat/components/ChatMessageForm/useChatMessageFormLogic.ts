import { type KeyboardEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { useConversationWithAI } from '@/features/Chat/hooks/useConversationWithAI';
import type { LLModel, OnSubmitArgs } from '@/features/Chat/types/chatTypes';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';

type ChatMessageFormData = {
  content: string;
};

export const useChatMessageFormLogic = (onSubmit?: (data: OnSubmitArgs) => void) => {
  const { id: chatId = '' } = useParams();
  const { value: currentModel, setValue: setModel } = useUrlParams<LLModel>(SearchParams.Model, {
    defaultValue: 'gemini-2.0-flash',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ChatMessageFormData>({
    resolver: zodResolver(
      z.object({
        content: z.string().min(1).trim(),
      })
    ),
    mode: 'onChange',
  });

  const { conversationWithAI, abortCurrentRequest, hasActiveRequest, isLoading, error } =
    useConversationWithAI(chatId);

  const handleModelChange = (newModel: string) => setModel(newModel as LLModel);

  const handleFormSubmit = (data: ChatMessageFormData) => {
    if (onSubmit) {
      // For new chat
      onSubmit({
        content: data.content,
        model: currentModel,
      });
    } else {
      // For existing chat
      conversationWithAI({
        chat_id: chatId,
        message_id: uuidv4(),
        content: data.content,
        model: currentModel,
      });
    }

    reset();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(handleFormSubmit)();
    }
  };

  return {
    hasActiveRequest,
    currentModel,
    isValid,
    isLoading,
    error,
    register,
    handleSubmit,
    handleFormSubmit,
    abortCurrentRequest,
    handleModelChange,
    handleKeyDown,
  };
};
