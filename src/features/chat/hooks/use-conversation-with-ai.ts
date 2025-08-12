import { produce } from 'immer';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

import { SWRCacheKeys } from '@shared/constants/api';

import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@shared/services/conversations/conversations-dtos';
import { ConversationsService } from '@shared/services/conversations/conversations-service';

import { useAbortControllerStore } from '@shared/stores/use-abort-controller-store';

import type { PaginatedResponse } from '@shared/types/common';
import type { ChatMessage } from '@shared/types/entities';

import { getInfiniteKey, handleLLMResponse } from '@features/chat/utils/swr';

export const useConversationWithAI = (chatId: string) => {
  const { mutate } = useSWRConfig();
  const {
    trigger,
    isMutating: isLoading,
    error,
  } = useSWRMutation(
    SWRCacheKeys.SendMessageToChat(chatId),
    async (_, { arg }: { arg: ConversationWithAIRequestDto }) => {
      const abortController = createAbortController(chatId);

      ConversationsService.conversationWithAI(
        arg,
        (chunk: ConversationWithAIResponseDto) => {
          handleLLMResponse(
            clearAbortController,
            chatId,
            arg.model,
            chunk,
            arg.branch_context?.parent_message_id,
            arg.branch_context?.parent_chat_id
          );
        },
        abortController.signal
      );
    }
  );

  const {
    abortControllers,
    createAbortController,
    clearAbortController,
    abortCurrentRequest,
  } = useAbortControllerStore();

  const conversationWithAI = async (body: ConversationWithAIRequestDto) => {
    const userMessage: ChatMessage = {
      id: body.message_id,
      created_at: new Date().toISOString(),
      content: body.content,
      role: 'user',
      branches: [],
      llm_model: body.model,
      reply_content: null,
    };

    await mutate(
      getInfiniteKey(chatId),
      produce((draft?: PaginatedResponse<ChatMessage[]>[]) => {
        const allMessages = draft?.flatMap(page => page.data || []);
        const messageExists = allMessages?.some(message => message.id === userMessage.id);

        if (messageExists) {
          return;
        }

        draft?.[0].data.unshift(userMessage);
      }),
      {
        revalidate: false,
        populateCache: true,
      }
    );

    await trigger(body, {
      rollbackOnError: true,
    });
  };

  return {
    conversationWithAI,
    abortCurrentRequest: () => abortCurrentRequest(chatId),
    hasActiveRequest: abortControllers.has(chatId),
    isLoading,
    error,
  };
};
