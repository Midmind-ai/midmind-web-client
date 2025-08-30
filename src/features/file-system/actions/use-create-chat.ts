import { v4 as uuidv4 } from 'uuid';

import { ITEMS_PER_PAGE } from '@features/chat/hooks/use-get-chat-messages';
import { useSplitScreenActions } from '@features/chat/hooks/use-split-screen-actions';
import type { LLModel } from '@features/chat/types/chat-types';
import { handleLLMResponse, getInfiniteKey } from '@features/chat/utils/swr';
import { useExpandedNodesStore } from '@features/file-system/stores/use-expanded-nodes-store';

import { CACHE_KEYS } from '@hooks/cache-keys';

import type { CreateNewChatRequestDto } from '@services/chats/chats-dtos';
import { ChatsService } from '@services/chats/chats-service';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@services/conversations/conversations-dtos';
import { ConversationsService } from '@services/conversations/conversations-service';

import { useAbortControllerStore } from '@stores/use-abort-controller-store';

import type { ChatBranchContext, Chat, ChatMessage } from '@shared-types/entities';

import { useSWRConfig, unstable_serialize } from '@lib/swr';

type CreateChatArgs = {
  content: string;
  model: LLModel;
  sendMessage?: boolean;
  openInSplitScreen?: boolean;
  parentChatId?: string;
  parentDirectoryId?: string;
  branchContext?: ChatBranchContext;
};

export const useCreateChat = () => {
  const { mutate, cache } = useSWRConfig();
  const { openChatInSplitView } = useSplitScreenActions();
  const expandNode = useExpandedNodesStore(state => state.expandNode);

  const clearAbortController = useAbortControllerStore(
    state => state.clearAbortController
  );
  const createAbortController = useAbortControllerStore(
    state => state.createAbortController
  );

  const createChat = async ({
    content,
    model,
    sendMessage = false,
    openInSplitScreen = false,
    parentChatId,
    parentDirectoryId,
    branchContext,
  }: CreateChatArgs) => {
    // Generate unique IDs for the chat and first message
    const chatId = uuidv4();
    const messageId = uuidv4();

    // Determine which cache to update based on parent relationship
    // - If parentDirectoryId exists: ['chats', 'directory', parentDirectoryId]
    // - If parentChatId exists: ['chats', 'chat', parentChatId]
    // - Otherwise: ['chats'] (root level)
    const cacheKey = CACHE_KEYS.chats.byParentId(parentDirectoryId, parentChatId);

    // Prepare the chat creation payload
    const newChatDto: CreateNewChatRequestDto = {
      id: chatId,
      name: 'New chat',
      directory_id: parentDirectoryId,
      // Add branch context if this is a branch chat (chat created from another chat)
      ...(branchContext &&
        parentChatId && {
          branch_context: {
            parent_chat_id: parentChatId,
            parent_message_id: branchContext.parent_message_id,
            selected_text: branchContext.selected_text,
            start_position: branchContext.start_position,
            end_position: branchContext.end_position,
            connection_type: branchContext.connection_type,
            context_type: branchContext.context_type,
          },
        }),
    };

    // STEP 1: Get current cache states for all affected caches
    const mainCacheState = cache.get(unstable_serialize(cacheKey));
    const mainCacheData = mainCacheState?.data;

    // For branch chats, we need to update the parent chat's has_children flag
    // The parent chat is located in the same directory as this new chat
    let parentCacheKey: ReturnType<typeof CACHE_KEYS.chats.byParentId> | null = null;
    let parentCacheData: Chat[] | undefined = undefined;

    if (parentChatId) {
      // Parent chat is in the same directory as the new chat we're creating
      parentCacheKey = CACHE_KEYS.chats.byParentId(parentDirectoryId, undefined);
      const parentCacheState = cache.get(unstable_serialize(parentCacheKey));
      parentCacheData = parentCacheState?.data;
    }

    // STEP 2: Create optimistic chat object
    const optimisticChat: Chat = {
      id: chatId,
      name: 'New chat',
      parent_directory_id: parentDirectoryId || null,
      parent_chat_id: parentChatId || null,
      has_children: false,
    };

    // STEP 3: Apply optimistic updates immediately to all affected caches

    // Update main chat cache with new chat
    const updatedMainCache = mainCacheData
      ? [optimisticChat, ...mainCacheData]
      : [optimisticChat];
    await mutate(cacheKey, updatedMainCache, { revalidate: false });

    // If this is a branch chat, update parent chat's has_children flag
    if (parentChatId && parentCacheKey && parentCacheData) {
      // Expand the parent chat node in the UI tree to show the new branch chat
      expandNode(parentChatId);

      // Update parent chat's has_children flag in the specific cache where it exists
      const updatedParentCache = parentCacheData.map((chat: Chat) =>
        chat.id === parentChatId ? { ...chat, has_children: true } : chat
      );
      await mutate(parentCacheKey, updatedParentCache, { revalidate: false });
    }

    if (openInSplitScreen) {
      openChatInSplitView(chatId);
    }

    // STEP 4: Make API calls with manual rollback on error
    try {
      // Create the chat on the server first
      await ChatsService.createNewChat(newChatDto);

      // Handle message sending if needed
      if (sendMessage) {
        // Generate unique ID for the AI response message
        const futureLLMMessageId = uuidv4();

        // Create the user's initial message
        const userMessage: ChatMessage = {
          id: messageId,
          content: content,
          role: 'user',
          branches: [],
          llm_model: model,
          created_at: new Date().toISOString(),
          reply_content: null,
          attachments: [],
        };

        // Create an empty AI message placeholder that will be filled by the streaming response
        const llmMessage: ChatMessage = {
          id: futureLLMMessageId,
          content: '', // Will be populated by the streaming AI response
          role: 'model',
          branches: [],
          llm_model: model,
          created_at: new Date().toISOString(),
          reply_content: null,
          attachments: [],
        };

        // Set up cache keys for message storage
        // We need both infinite key (for pagination) and direct key (for compatibility)
        const infiniteKey = getInfiniteKey(chatId);
        const messagesKey = `${CACHE_KEYS.messages.byChatId(chatId)}?page=0&skip=0&take=${ITEMS_PER_PAGE}`;

        // Populate infinite scroll cache (used by chat message list)
        await mutate(
          infiniteKey,
          [
            {
              data: [llmMessage, userMessage], // AI message first (newest), then user message
              meta: {
                total: 2,
                lastPage: 1,
                currentPage: 1,
                perPage: 20,
                prev: null,
                next: null,
              },
            },
          ],
          {
            revalidate: false,
            populateCache: true,
          }
        );

        // Also populate direct string key cache for backwards compatibility
        await mutate(
          messagesKey,
          {
            data: [llmMessage, userMessage],
            meta: {
              total: 2,
              lastPage: 1,
              currentPage: 1,
              perPage: 20,
              prev: null,
              next: null,
            },
          },
          {
            revalidate: false,
            populateCache: true,
          }
        );

        // Prepare the conversation request for the AI service
        const conversationBody: ConversationWithAIRequestDto = {
          chat_id: chatId,
          message_id: messageId,
          future_llm_message_id: futureLLMMessageId,
          content,
          model,
          // Include branch context if this is a branch chat
          ...(branchContext && {
            branch_context: {
              parent_message_id: branchContext.parent_message_id,
            },
          }),
        };

        // Create an abort controller to handle cancellation of the AI request
        const newAbortController = createAbortController(chatId);

        // Start the streaming AI conversation
        // This will call handleLLMResponse for each chunk of the AI response
        ConversationsService.conversationWithAI(
          conversationBody,
          (chunk: ConversationWithAIResponseDto) => {
            handleLLMResponse(
              clearAbortController,
              chatId,
              model,
              chunk,
              messageId, // parentMessageId - the user message that triggered this
              parentChatId // parentChatId - if this is a branch chat
            );
          },
          newAbortController.signal
        );
      }
    } catch (error) {
      // STEP 5: Manual rollback on error - restore all original cache states

      // Restore main chat cache
      await mutate(cacheKey, mainCacheData, { revalidate: false });

      // Restore parent cache if this was a branch chat
      if (parentChatId && parentCacheKey && parentCacheData) {
        await mutate(parentCacheKey, parentCacheData, { revalidate: false });
      }

      // Re-throw error so it gets handled by global error handler
      throw error;
    }

    return chatId;
  };

  return {
    createChat,
  };
};
