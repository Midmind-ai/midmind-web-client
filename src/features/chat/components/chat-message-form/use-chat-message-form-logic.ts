import { type KeyboardEvent, useRef, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { DEFAULT_AI_MODEL } from '@features/chat/constants/ai-models';
import { useConversationWithAI } from '@features/chat/hooks/use-conversation-with-ai';
import type { OnSubmitArgs, LLModel } from '@features/chat/types/chat-types';
import {
  subscribeToMessageReply,
  unsubscribeFromMessageReply,
  type MessageReplyEvent,
} from '@features/chat/utils/message-reply-emitter';

import type { ConversationWithAIRequestDto } from '@services/conversations/conversations-dtos';

type ChatMessageFormData = {
  content: string;
  model: LLModel;
  replyInfo?: {
    id: string;
    content: string;
  };
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

  const lastProcessedContextRef = useRef<string>('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<ChatMessageFormData>({
    resolver: zodResolver(
      z.object({
        content: z.string().min(1, 'Message cannot be empty'),
        model: z.enum([
          'gemini-2.0-flash-lite',
          'gemini-2.0-flash',
          'gemini-2.5-flash',
          'gemini-2.5-pro',
        ]),
        replyInfo: z
          .object({
            content: z.string(),
            id: z.string(),
          })
          .optional(),
      })
    ),
    values: {
      content: '',
      model: DEFAULT_AI_MODEL,
      replyInfo: undefined,
    },
    mode: 'onChange',
  });

  const actualChatId = chatId || urlChatId;
  const replyInfo = watch('replyInfo');

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
      const currentContext = `${actualChatId}:${branchContext?.parent_message_id || ''}`;
      const shouldIncludeBranchContext =
        branchContext && currentContext !== lastProcessedContextRef.current;

      conversationWithAI({
        chat_id: actualChatId,
        message_id: uuidv4(),
        content: data.content,
        model: data.model,
        ...(data.replyInfo && { reply_to: data.replyInfo }),
        ...(shouldIncludeBranchContext && { branch_context: branchContext }),
      });

      if (shouldIncludeBranchContext) {
        lastProcessedContextRef.current = currentContext;
      }
    }

    reset({
      content: '',
      model: data.model,
      replyInfo: undefined,
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(handleFormSubmit)();
    }

    if (event.key === 'Escape') {
      reset({
        replyInfo: undefined,
      });
    }
  };

  useEffect(() => {
    // For home page
    if (!actualChatId) {
      return;
    }

    const handleMessageReply = (event: MessageReplyEvent) => {
      if (event.targetChatId && event.targetChatId !== actualChatId) {
        return;
      }

      setValue('replyInfo', {
        id: event.replyTo.id,
        content: event.replyTo.content,
      });
    };

    subscribeToMessageReply(handleMessageReply);

    return () => {
      unsubscribeFromMessageReply(handleMessageReply);
    };
  }, [setValue, actualChatId]);

  return {
    isValid,
    hasActiveRequest,
    isLoading,
    error,
    control,
    replyInfo,
    register,
    handleSubmit,
    handleFormSubmit,
    abortCurrentRequest,
    handleKeyDown,
  };
};
