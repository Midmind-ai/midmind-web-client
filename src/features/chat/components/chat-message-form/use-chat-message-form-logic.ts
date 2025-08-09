import { type KeyboardEvent, useRef, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import { useConversationWithAI } from '@features/chat/hooks/use-conversation-with-ai';
import type { LLModel, OnSubmitArgs } from '@features/chat/types/chat-types';

type ChatMessageFormData = {
  content: string;
};

type UseChatMessageFormLogicProps = {
  chatId?: string;
  branchContext?: ConversationWithAIRequestDto['branch_context'];
  onSubmit?: (data: OnSubmitArgs) => void;
};

export const useChatMessageFormLogic = ({
  chatId,
  onSubmit,
  branchContext,
}: UseChatMessageFormLogicProps) => {
  const { id: urlChatId = '' } = useParams();
  const { value: currentModel, setValue: setModel } = useUrlParams<LLModel>(
    SearchParams.Model,
    {
      defaultValue: 'gemini-2.0-flash-lite',
    }
  );

  const hasFirstMessageInNewBranchSent = useRef(false);

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

  const actualChatId = chatId || urlChatId;

  const { conversationWithAI, abortCurrentRequest, hasActiveRequest, isLoading, error } =
    useConversationWithAI(actualChatId);

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
      const shouldIncludeThreadContext =
        branchContext && !hasFirstMessageInNewBranchSent.current;

      conversationWithAI({
        chat_id: actualChatId,
        message_id: uuidv4(),
        content: data.content,
        model: currentModel,
        ...(shouldIncludeThreadContext && { branch_context: branchContext }),
      });

      if (shouldIncludeThreadContext) {
        hasFirstMessageInNewBranchSent.current = true;
      }
    }

    reset();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(handleFormSubmit)();
    }
  };

  useEffect(() => {
    hasFirstMessageInNewBranchSent.current = false;
  }, [branchContext, actualChatId]);

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
