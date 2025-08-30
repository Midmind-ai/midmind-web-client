import { type KeyboardEvent, useRef, useEffect, type ClipboardEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import type { SupportedFileFormat } from '@constants/files';

import { AI_MODELS, DEFAULT_AI_MODEL } from '@features/chat/constants/ai-models';
import { useConversationWithAI } from '@features/chat/hooks/use-conversation-with-ai';
import type {
  OnSubmitArgs,
  LLModel,
  AttachmentProgress,
} from '@features/chat/types/chat-types';
import {
  subscribeToMessageReply,
  unsubscribeFromMessageReply,
  type MessageReplyEvent,
} from '@features/chat/utils/message-reply-emitter';

import { useModalOperations } from '@hooks/logic/use-modal-operations';

import type { ConversationWithAIRequestDto } from '@services/conversations/conversations-dtos';
import { FilesService } from '@services/files/files-service';

type ChatMessageFormData = {
  content: string;
  model: LLModel;
  attachments?: AttachmentProgress[];
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
        content: z.string().min(1),
        model: z.enum([
          AI_MODELS.GEMINI_2_0_FLASH_LITE,
          AI_MODELS.GEMINI_2_0_FLASH,
          AI_MODELS.GEMINI_2_5_FLASH,
          AI_MODELS.GEMINI_2_5_PRO,
        ]),
        attachments: z
          .array(
            z.object({
              id: z.string(),
              progress: z.number(),
              file: z.instanceof(File),
            })
          )
          .optional(),
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
      attachments: [],
      replyInfo: undefined,
    },
    mode: 'onChange',
  });

  const { openModal } = useModalOperations();

  const actualChatId = chatId || urlChatId;
  const replyInfo = watch('replyInfo');
  const attachments = watch('attachments') || [];

  const { conversationWithAI, abortCurrentRequest, hasActiveRequest, isLoading, error } =
    useConversationWithAI(actualChatId);

  const handleSubmitForm = (data: ChatMessageFormData) => {
    if (onSubmit) {
      // For new chat
      onSubmit({
        content: data.content,
        model: data.model,
        attachments: data.attachments?.map(att => att.id).filter(Boolean) || [],
      });
    } else {
      // For existing chat
      const currentContext = `${actualChatId}:${branchContext?.parent_message_id || ''}`;
      const shouldIncludeBranchContext =
        branchContext && currentContext !== lastProcessedContextRef.current;

      const attachmentIds = data.attachments?.map(att => att.id) || [];

      conversationWithAI({
        chat_id: actualChatId,
        message_id: uuidv4(),
        future_llm_message_id: uuidv4(),
        content: data.content,
        model: data.model,
        ...(data.attachments &&
          data.attachments.length > 0 && {
            attachments: data.attachments.map(att => att.id),
          }),
        ...(attachmentIds.length > 0 && { attachments: attachmentIds }),
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
      attachments: [],
      replyInfo: undefined,
    });
  };

  const handleReplyClose = () => {
    setValue('replyInfo', undefined);
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleOpenFileViewModal = (file: File) => {
    openModal('FileViewModal', {
      file,
    });
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    const currentAttachments = watch('attachments') || [];

    const newAttachments: AttachmentProgress[] = Array.from(files).map(file => ({
      id: '',
      progress: 0,
      file,
    }));

    setValue('attachments', [...currentAttachments, ...newAttachments]);

    await Promise.all(
      newAttachments.map(async (attachment, index): Promise<void> => {
        const actualIndex = currentAttachments.length + index;

        const currentAttachmentsForLocal = watch('attachments') || [];
        const updatedAttachments = [...currentAttachmentsForLocal];

        if (updatedAttachments[actualIndex]) {
          updatedAttachments[actualIndex] = {
            ...updatedAttachments[actualIndex],
            progress: 0,
          };
        }

        setValue('attachments', updatedAttachments);

        const initResponse = await FilesService.initFileUpload(
          {
            mime_type: attachment.file.type as SupportedFileFormat,
            original_filename: attachment.file.name,
            size_bytes: attachment.file.size,
            extension: attachment.file.name.split('.').pop() || '',
          },
          progressEvent => {
            const currentProgress = Math.round(
              (progressEvent.loaded / (progressEvent?.total ?? 0)) * 100
            );

            const currentAttachmentsForProgress = watch('attachments') || [];
            const updatedAttachments = [...currentAttachmentsForProgress];

            if (updatedAttachments[actualIndex]) {
              updatedAttachments[actualIndex] = {
                ...updatedAttachments[actualIndex],
                progress: currentProgress,
              };
            }

            setValue('attachments', updatedAttachments);
          }
        );

        const currentAttachmentsForId = watch('attachments') || [];
        const updatedAttachmentsWithId = [...currentAttachmentsForId];

        if (updatedAttachmentsWithId[actualIndex]) {
          updatedAttachmentsWithId[actualIndex] = {
            ...updatedAttachmentsWithId[actualIndex],
            id: initResponse.file_id,
          };
        }

        setValue('attachments', updatedAttachmentsWithId);

        await fetch(initResponse.upload_url, {
          method: 'POST',
          body: attachment.file,
        });

        await FilesService.finalizeFileUpload(initResponse.file_id, {
          actual_size_bytes: attachment.file.size,
          status: 'uploaded',
        });
      })
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImagePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;

    if (!items) return;

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();

        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();

      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));

      handleImageUpload(dataTransfer.files);
    }
  };

  const handleImageRemove = (index: number) => {
    const currentAttachments = watch('attachments') || [];

    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);

    setValue('attachments', updatedAttachments);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      handleSubmit(handleSubmitForm)();
    }

    if (event.key === 'Escape') {
      handleReplyClose();
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
    attachments,
    fileInputRef,
    register,
    handleSubmit,
    handleSubmitForm,
    abortCurrentRequest,
    handleKeyDown,
    handleOpenFileViewModal,
    handleReplyClose,
    handleImageUpload,
    handleImageRemove,
    handleImageButtonClick,
    handleImagePaste,
  };
};
