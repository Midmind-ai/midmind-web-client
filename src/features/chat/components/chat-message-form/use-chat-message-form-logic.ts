import { type KeyboardEvent, useRef, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { AI_MODELS, DEFAULT_AI_MODEL } from '@features/chat/constants/ai-models';
import { useConversationWithAI } from '@features/chat/hooks/use-conversation-with-ai';
import type { OnSubmitArgs, LLModel } from '@features/chat/types/chat-types';
import {
  subscribeToMessageReply,
  unsubscribeFromMessageReply,
  type MessageReplyEvent,
} from '@features/chat/utils/message-reply-emitter';

import { useModalOperations } from '@hooks/logic/use-modal-operations';

import type { ConversationWithAIRequestDto } from '@services/conversations/conversations-dtos';

type ChatMessageFormData = {
  content: string;
  model: LLModel;
  files?: File[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          AI_MODELS.GEMINI_2_0_FLASH_LITE,
          AI_MODELS.GEMINI_2_0_FLASH,
          AI_MODELS.GEMINI_2_5_FLASH,
          AI_MODELS.GEMINI_2_5_PRO,
        ]),
        files: z.array(z.instanceof(File)).optional(),
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
      files: [],
      replyInfo: undefined,
    },
    mode: 'onChange',
  });
  const { openModal } = useModalOperations();

  const actualChatId = chatId || urlChatId;
  const replyInfo = watch('replyInfo');
  const selectedImages = watch('files') || [];

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
        future_llm_message_id: uuidv4(),
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
      files: [],
      replyInfo: undefined,
    });
  };

  const handleCloseReply = () => {
    reset({
      replyInfo: undefined,
    });
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openFileViewModal = (file: File) => {
    openModal('FileViewModal', {
      file,
    });
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).filter(
      file => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    const currentImages = watch('files') || [];
    setValue('files', [...currentImages, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = watch('files') || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue('files', updatedImages);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(handleFormSubmit)();
    }

    if (event.key === 'Escape') {
      handleCloseReply();
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
    selectedImages,
    fileInputRef,
    register,
    handleSubmit,
    handleFormSubmit,
    abortCurrentRequest,
    handleKeyDown,
    openFileViewModal,
    handleCloseReply,
    handleImageUpload,
    handleRemoveImage,
    handleImageButtonClick,
  };
};
