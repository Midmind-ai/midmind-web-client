import { type KeyboardEvent, useRef, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import type { ConversationWithAIRequestDto } from '@shared/services/conversations/conversations-dtos';

import { DEFAULT_AI_MODEL } from '@features/chat/constants/ai-models';
import { useConversationWithAI } from '@features/chat/hooks/use-conversation-with-ai';
import type { OnSubmitArgs, LLModel } from '@features/chat/types/chat-types';

type ChatMessageFormData = {
  content: string;
  model: LLModel;
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

  const hasFirstMessageInNewBranchSent = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isValid },
  } = useForm<ChatMessageFormData>({
    resolver: zodResolver(
      z.object({
        content: z.string().min(1).trim(),
        model: z.enum([
          'gemini-2.0-flash-lite',
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
        ]),
      })
    ),
    defaultValues: {
      content: '',
      model: DEFAULT_AI_MODEL,
    },
    mode: 'onChange',
  });

  const actualChatId = chatId || urlChatId;

  const { conversationWithAI, abortCurrentRequest, hasActiveRequest, isLoading, error } =
    useConversationWithAI(actualChatId);

  const handleFormSubmit = (data: ChatMessageFormData) => {
    if (onSubmit) {
      // For new chat
      onSubmit({
        content: data.content,
        model: data.model,
      });
    } else {
      // For existing chat
      const shouldIncludeThreadContext =
        branchContext && !hasFirstMessageInNewBranchSent.current;

      conversationWithAI({
        chat_id: actualChatId,
        message_id: uuidv4(),
        content: data.content,
        model: data.model,
        ...(shouldIncludeThreadContext && { branch_context: branchContext }),
      });

      if (shouldIncludeThreadContext) {
        hasFirstMessageInNewBranchSent.current = true;
      }
    }

    reset({
      content: '',
      model: data.model,
    });
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
    isValid,
    isLoading,
    error,
    register,
    control,
    handleSubmit,
    handleFormSubmit,
    abortCurrentRequest,
    handleKeyDown,
  };
};
