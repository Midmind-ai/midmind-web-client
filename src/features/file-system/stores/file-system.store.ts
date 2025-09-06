import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ITEMS_PER_PAGE } from '@features/chat-old/hooks/use-get-chat-messages';
import type { LLModel } from '@features/chat-old/types/chat-types';
import { handleLLMResponse } from '@features/chat-old/utils/swr';
import { useExpandedNodesStore } from '@features/file-system/stores/expanded-nodes.store';
import { useInlineEditStore } from '@features/file-system/stores/inline-edit.store';

import { findCacheKeysByPattern, CACHE_KEYS } from '@hooks/cache-keys';

import type { CreateNewChatRequestDto } from '@services/chats/chats-dtos';
import { ChatsService } from '@services/chats/chats-service';
import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@services/conversations/conversations-dtos';
import { ConversationsService } from '@services/conversations/conversations-service';
import { DirectoriesService } from '@services/directories/directories-service';

import { useEntityCreationStateStore } from '@stores/entity-creation-state.store';
import { useAbortControllerStore } from '@stores/use-abort-controller-store';

import { EntityEnum } from '@shared-types/entities';
import type {
  Directory,
  Chat,
  ChatMessage,
  ChatBranchContext,
} from '@shared-types/entities';

import { mutate } from '@lib/swr';

type Node = (Directory | Chat) & {
  type: EntityEnum;
};

type FileSystemStoreType = {
  nodes: Array<Node>;
  childrenOf: Record<string | 'root', string[]>;
  parentOf: Record<string, string | 'root'>;
  isLoadingParentIds: string[]; // Track which parents are currently loading

  setNodes: (nodes: Array<Directory | Chat>, parentId: string | 'root') => void;

  // Data loading methods (replacing SWR)
  loadDirectories: (parentId?: string | 'root') => Promise<void>;
  loadChatsByDirectory: (parentDirectoryId?: string | 'root') => Promise<void>;
  loadChatsByParentChat: (parentChatId?: string | 'root') => Promise<void>;
  loadData: (parentId?: string | 'root', parentType?: EntityEnum) => Promise<void>;

  createChat: (args: {
    content: string;
    model: LLModel;
    sendMessage?: boolean;
    openInSplitScreen?: boolean;
    parentChatId?: string;
    parentFolderId?: string;
    branchContext?: ChatBranchContext;
    navigate?: (chatId: string) => void;
  }) => Promise<string>;
  renameChat: (nodeId: string, newName: string) => Promise<void>;
  renameFolder: (nodeId: string, newName: string) => Promise<void>;
  deleteChat: (
    id: string,
    parentFolderId?: string,
    parentChatId?: string
  ) => Promise<void>;
  deleteFolder: (id: string, parentFolderId?: string) => Promise<void>;
  moveChat: (
    chatId: string,
    sourceParentFolderId?: string | null,
    sourceParentChatId?: string | null,
    targetParentFolderId?: string | null
  ) => Promise<void>;
  moveFolder: (
    folderId: string,
    sourceParentFolderId?: string | null,
    targetParentFolderId?: string | null
  ) => Promise<void>;
  createTemporaryFolder: (parentFolderId?: string) => string;
  finalizeFolderCreation: (
    id: string,
    name: string,
    parentFolderId?: string
  ) => Promise<void>;
  removeTemporaryFolder: (id: string, parentFolderId?: string) => void;

  // Loading state helpers
  isParentLoading: (parentId: string | 'root') => boolean;
};

export const useFileSystemStore = create<FileSystemStoreType>()(
  devtools(
    (set, get) => ({
      nodes: [],
      childrenOf: {},
      parentOf: {},
      isLoadingParentIds: [],

      setNodes: (newNodes, parentId = 'root') => {
        set(state => {
          // Get IDs of new nodes
          const newNodeIds = new Set(newNodes.map(node => node.id));

          // Remove any existing nodes with the same IDs (to prevent duplicates)
          const existingNodesWithoutDuplicates = state.nodes.filter(
            node => !newNodeIds.has(node.id)
          );

          // Add type property to new nodes if missing
          const typedNewNodes = newNodes.map(node => ({
            ...node,
            type:
              node.type ||
              ('entity_type' in node
                ? (node as unknown as { entity_type: EntityEnum }).entity_type
                : EntityEnum.Folder),
          }));

          // Combine existing nodes + new nodes
          const allNodes = [...existingNodesWithoutDuplicates, ...typedNewNodes];

          // Update children mapping for this parent
          const newChildrenIds = newNodes.map(item => item.id);

          // Clean up parentOf for nodes that are no longer children of this parent
          const oldChildrenIds = state.childrenOf[parentId] || [];
          const removedChildrenIds = oldChildrenIds.filter(
            id => !newChildrenIds.includes(id)
          );

          const updatedParentOf = { ...state.parentOf };

          // Remove parent mapping for removed children
          removedChildrenIds.forEach(id => {
            if (updatedParentOf[id] === parentId) {
              delete updatedParentOf[id];
            }
          });

          // Add parent mapping for new children
          newNodes.forEach(node => {
            updatedParentOf[node.id] = parentId;
          });

          return {
            ...state,
            nodes: allNodes,
            childrenOf: {
              ...state.childrenOf,
              [parentId]: newChildrenIds,
            },
            parentOf: updatedParentOf,
          };
        });
      },

      // Data loading methods (replacing SWR)
      loadDirectories: async (parentId = 'root') => {
        try {
          // Convert 'root' to undefined for service call
          const serviceParentId = parentId === 'root' ? undefined : parentId;

          const directories = await DirectoriesService.getDirectories(serviceParentId);

          // Add type to directories (same as SWR hook did)
          const directoriesWithType = directories.map(item => ({
            ...item,
            type: EntityEnum.Folder,
          }));

          // Update store with loaded directories
          const state = get();
          const existingNodes = state.nodes.filter(
            node =>
              // Keep nodes that are not directories from this parent
              state.parentOf[node.id] !== parentId || node.type !== EntityEnum.Folder
          );

          set(state => ({
            ...state,
            nodes: [...existingNodes, ...directoriesWithType],
            childrenOf: {
              ...state.childrenOf,
              [parentId]: [
                ...directoriesWithType.map(d => d.id),
                ...(state.childrenOf[parentId]?.filter(id => {
                  const node = state.nodes.find(n => n.id === id);

                  return node?.type !== EntityEnum.Folder;
                }) || []),
              ],
            },

            parentOf: {
              ...state.parentOf,
              ...directoriesWithType.reduce(
                (acc, d) => ({ ...acc, [d.id]: parentId }),
                {}
              ),
            },
          }));
        } catch (error) {
          console.error('Error loading directories:', error);
          throw error;
        }
      },

      loadChatsByDirectory: async (parentDirectoryId = 'root') => {
        try {
          // Convert 'root' to undefined for service call
          const serviceParentId =
            parentDirectoryId === 'root' ? undefined : parentDirectoryId;

          const chats = await ChatsService.getChats({
            parentDirectoryId: serviceParentId,
          });

          // Add type to chats (same as SWR hook did)
          const chatsWithType = chats.map(item => ({
            ...item,
            type: EntityEnum.Chat,
          }));

          // Update store with loaded chats
          const state = get();
          const existingNodes = state.nodes.filter(
            node =>
              // Keep nodes that are not chats from this parent directory
              !(
                state.parentOf[node.id] === parentDirectoryId &&
                node.type === EntityEnum.Chat &&
                !(node as Chat).parent_chat_id
              )
          );

          set(state => ({
            ...state,
            nodes: [...existingNodes, ...chatsWithType],
            childrenOf: {
              ...state.childrenOf,
              [parentDirectoryId]: [
                ...(state.childrenOf[parentDirectoryId]?.filter(id => {
                  const node = state.nodes.find(n => n.id === id);

                  return (
                    node?.type === EntityEnum.Folder || (node as Chat)?.parent_chat_id
                  );
                }) || []),
                ...chatsWithType.map(c => c.id),
              ],
            },

            parentOf: {
              ...state.parentOf,
              ...chatsWithType.reduce(
                (acc, c) => ({ ...acc, [c.id]: parentDirectoryId }),
                {}
              ),
            },
          }));
        } catch (error) {
          console.error('Error loading chats by directory:', error);
          throw error;
        }
      },

      loadChatsByParentChat: async (parentChatId = 'root') => {
        try {
          // Convert 'root' to undefined for service call
          const serviceParentId = parentChatId === 'root' ? undefined : parentChatId;

          const chats = await ChatsService.getChats({ parentChatId: serviceParentId });

          // Add type to chats (same as SWR hook did)
          const chatsWithType = chats.map(item => ({
            ...item,
            type: EntityEnum.Chat,
          }));

          // Update store with loaded chats
          const state = get();
          const existingNodes = state.nodes.filter(
            node =>
              // Keep nodes that are not sub-chats of this parent chat
              !(
                state.parentOf[node.id] === parentChatId &&
                node.type === EntityEnum.Chat &&
                (node as Chat).parent_chat_id
              )
          );

          set(state => ({
            ...state,
            nodes: [...existingNodes, ...chatsWithType],
            childrenOf: {
              ...state.childrenOf,
              [parentChatId]: [
                ...(state.childrenOf[parentChatId] || []).filter(id => {
                  const node = state.nodes.find(n => n.id === id);

                  return !(
                    node?.type === EntityEnum.Chat && (node as Chat)?.parent_chat_id
                  );
                }),
                ...chatsWithType.map(c => c.id),
              ],
            },

            parentOf: {
              ...state.parentOf,
              ...chatsWithType.reduce((acc, c) => ({ ...acc, [c.id]: parentChatId }), {}),
            },
          }));
        } catch (error) {
          console.error('Error loading chats by parent chat:', error);
          throw error;
        }
      },

      loadData: async (parentId = 'root', parentType?: EntityEnum) => {
        // Add to loading state at the start
        set(state => ({
          ...state,
          isLoadingParentIds: [...new Set([...state.isLoadingParentIds, parentId])],
        }));

        try {
          const loadingPromises: Promise<void>[] = [];

          // Load directories and chats by directory in parallel (unless parent is a chat)
          if (parentType !== EntityEnum.Chat) {
            loadingPromises.push(get().loadDirectories(parentId));
            loadingPromises.push(get().loadChatsByDirectory(parentId));
          }

          // Load chats by parent chat (if parent is a chat)
          if (parentType === EntityEnum.Chat) {
            loadingPromises.push(get().loadChatsByParentChat(parentId));
          }

          // Execute all loading operations in parallel
          await Promise.allSettled(loadingPromises);
        } catch (error) {
          console.error('Error loading data:', error);
          throw error;
        } finally {
          // Remove from loading state when done (success or error)
          set(state => ({
            ...state,
            isLoadingParentIds: [
              ...state.isLoadingParentIds.filter(id => id !== parentId),
            ],
          }));
        }
      },

      createChat: async ({
        content,
        model,
        sendMessage = false,
        openInSplitScreen = false,
        parentChatId,
        parentFolderId,
        branchContext,
        navigate,
      }) => {
        const chatId = uuidv4();
        const messageId = uuidv4();
        const futureLLMMessageId = uuidv4();
        const chatDetailsCacheKey = CACHE_KEYS.chats.details(chatId);
        const messagesCacheKey = `${CACHE_KEYS.messages.byChatId(chatId)}?page=0&skip=0&take=${ITEMS_PER_PAGE}`;

        const state = get();
        const originalNodes = [...state.nodes];
        const originalChildrenOf = { ...state.childrenOf };
        const originalParentOf = { ...state.parentOf };

        const parentId = parentChatId || 'root';

        // Create optimistic chat object
        const optimisticChat: Node = {
          id: chatId,
          name: 'New chat',
          type: EntityEnum.Chat,
          parent_folder_id: parentFolderId || null,
          parent_chat_id: parentChatId || null,
          has_children: false,
        };

        // Mark chat as being created to prevent API calls
        const { startCreating } = useEntityCreationStateStore.getState();
        startCreating(chatId);

        // Optimistic update to store
        set(state => {
          const updatedNodes = [optimisticChat, ...state.nodes];
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Add to parent's children list
          if (updatedChildrenOf[parentId]) {
            updatedChildrenOf[parentId] = [chatId, ...updatedChildrenOf[parentId]];
          } else {
            updatedChildrenOf[parentId] = [chatId];
          }

          // Set parent relationship
          updatedParentOf[chatId] = parentId;

          // Update parent chat's has_children flag if this is a branch chat
          const finalNodes = parentChatId
            ? updatedNodes.map(node =>
                node.id === parentChatId ? { ...node, has_children: true } : node
              )
            : updatedNodes;

          return {
            ...state,
            nodes: finalNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });

        // Expand parent chat node if this is a branch
        if (parentChatId) {
          const { expandNode } = useExpandedNodesStore.getState();
          expandNode(parentChatId);
        }

        // Add optimistic chat data into cache
        await mutate(chatDetailsCacheKey, optimisticChat);

        // Handle message sending if needed
        if (sendMessage) {
          // Create the user's initial message
          const userMessage: ChatMessage = {
            id: messageId,
            content: content,
            role: 'user',
            nested_chats: [],
            llm_model: model,
            created_at: new Date().toISOString(),
            reply_content: null,
            attachments: [],
          };

          // Create an empty AI message placeholder
          const llmMessage: ChatMessage = {
            id: futureLLMMessageId,
            content: '',
            role: 'model',
            nested_chats: [],
            llm_model: model,
            created_at: new Date().toISOString(),
            reply_content: null,
            attachments: [],
          };

          // Add messages in cache optimistically
          await mutate(
            messagesCacheKey,
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
            { revalidate: false, populateCache: true }
          );
        }

        // Handle split screen opening
        if (openInSplitScreen) {
          const { openChatInSplitView } = await import(
            '@features/chat-old/hooks/use-split-screen-actions'
          );
          openChatInSplitView(chatId, parentChatId);
        }

        if (navigate) navigate(chatId);

        try {
          // Prepare the chat creation payload
          const newChatDto: CreateNewChatRequestDto = {
            id: chatId,
            name: 'New chat',
            folder_id: parentFolderId,
            ...(branchContext &&
              parentChatId && {
                chat_metadata: {
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

          // Create the chat on the server
          await ChatsService.createNewChat(newChatDto);

          if (sendMessage) {
            // Prepare conversation request
            const conversationBody: ConversationWithAIRequestDto = {
              chat_id: chatId,
              message_id: messageId,
              future_llm_message_id: futureLLMMessageId,
              content,
              model,
              ...(branchContext && {
                chat_metadata: {
                  parent_message_id: branchContext.parent_message_id,
                },
              }),
            };

            // Create abort controller and start AI conversation
            const { createAbortController, clearAbortController } =
              useAbortControllerStore.getState();
            const newAbortController = createAbortController(chatId);

            ConversationsService.conversationWithAI(
              conversationBody,
              (chunk: ConversationWithAIResponseDto) => {
                // console.log(chunk);
                handleLLMResponse(
                  clearAbortController,
                  chatId,
                  model,
                  chunk,
                  messageId,
                  parentChatId
                );
              },
              newAbortController.signal
            );
          }

          return chatId;
        } catch (error) {
          set({
            nodes: originalNodes,
            childrenOf: originalChildrenOf,
            parentOf: originalParentOf,
          });
          await mutate(chatDetailsCacheKey, undefined, { revalidate: true });
          await mutate(messagesCacheKey, undefined, { revalidate: true });

          throw error;
        } finally {
          // Mark chat creation as finished
          const { finishCreating } = useEntityCreationStateStore.getState();
          finishCreating(chatId);
        }
      },

      renameChat: async (nodeId, newName) => {
        const state = get();
        const originalNode = state.nodes.find(node => node.id === nodeId);
        if (!originalNode) {
          throw new Error('Chat not found');
        }

        // Optimistic update
        set(state => ({
          ...state,
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, name: newName } : node
          ),
        }));

        try {
          await ChatsService.updateChatDetails(nodeId, { name: newName });
          // Revalidate breadcrumb caches after successful rename
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set(state => ({
            ...state,
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, name: originalNode.name } : node
            ),
          }));
          throw error;
        }
      },

      renameFolder: async (nodeId, newName) => {
        const state = get();
        const originalNode = state.nodes.find(node => node.id === nodeId);
        if (
          !originalNode ||
          (originalNode.type !== EntityEnum.Folder &&
            originalNode.type !== EntityEnum.Mindlet)
        ) {
          throw new Error('Folder not found');
        }

        // Optimistic update
        set(state => ({
          ...state,
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, name: newName } : node
          ),
        }));

        try {
          await DirectoriesService.updateDirectory(nodeId, {
            name: newName,
          });
          // Revalidate breadcrumb caches after successful rename
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set(state => ({
            ...state,
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, name: originalNode.name } : node
            ),
          }));
          throw error;
        }
      },

      deleteChat: async (id, parentFolderId, parentChatId) => {
        const state = get();
        const parentId = parentChatId || parentFolderId || 'root';

        // Store original state for rollback
        const originalNodes = [...state.nodes];
        const originalChildrenOf = { ...state.childrenOf };
        const originalParentOf = { ...state.parentOf };

        // Check if this is the last child of the parent
        const siblings = state.childrenOf[parentId] || [];
        const isLastChild = siblings.length === 1 && siblings[0] === id;

        // Optimistic update - remove the chat immediately
        set(state => {
          const updatedNodes = state.nodes.filter(node => node.id !== id);
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Remove from parent's children list
          if (updatedChildrenOf[parentId]) {
            updatedChildrenOf[parentId] = updatedChildrenOf[parentId].filter(
              childId => childId !== id
            );
          }

          // Remove from parentOf mapping
          delete updatedParentOf[id];

          // Remove any children entries for this chat
          delete updatedChildrenOf[id];

          // Update parent's has_children if this was the last child
          const finalNodes =
            isLastChild && parentChatId
              ? updatedNodes.map(node =>
                  node.id === parentChatId ? { ...node, has_children: false } : node
                )
              : updatedNodes;

          return {
            ...state,
            nodes: finalNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });

        try {
          // Make API call
          await ChatsService.deleteChat(id);

          // Clear related caches after successful deletion
          await mutate(['chat', id], undefined, { revalidate: false });
          await mutate(findCacheKeysByPattern(['messages', id]), undefined, {
            revalidate: false,
          });

          // Revalidate breadcrumb caches
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set({
            nodes: originalNodes,
            childrenOf: originalChildrenOf,
            parentOf: originalParentOf,
          });
          throw error;
        }
      },

      deleteFolder: async (id, parentFolderId) => {
        const state = get();
        const parentId = parentFolderId || 'root';

        // Store original state for rollback
        const originalNodes = [...state.nodes];
        const originalChildrenOf = { ...state.childrenOf };
        const originalParentOf = { ...state.parentOf };

        // Optimistic update - remove the directory immediately
        set(state => {
          const updatedNodes = state.nodes.filter(node => node.id !== id);
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Remove from parent's children list
          if (updatedChildrenOf[parentId]) {
            updatedChildrenOf[parentId] = updatedChildrenOf[parentId].filter(
              childId => childId !== id
            );
          }

          // Remove from parentOf mapping
          delete updatedParentOf[id];

          // Remove any children entries for this directory
          delete updatedChildrenOf[id];

          return {
            ...state,
            nodes: updatedNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });

        try {
          // Make API call
          await DirectoriesService.deleteDirectory(id);

          // Clear related caches after successful deletion
          await mutate(findCacheKeysByPattern(['directories', id]), undefined, {
            revalidate: false,
          });
          await mutate(findCacheKeysByPattern(['chats', 'directories', id]), undefined, {
            revalidate: false,
          });

          // Revalidate breadcrumb caches
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set({
            nodes: originalNodes,
            childrenOf: originalChildrenOf,
            parentOf: originalParentOf,
          });
          throw error;
        }
      },

      moveChat: async (
        chatId,
        sourceParentFolderId = 'root',
        _sourceParentChatId = 'root',
        targetParentFolderId = 'root'
      ) => {
        if (sourceParentFolderId === targetParentFolderId) return;

        const state = get();

        // Find the chat to move
        const chatToMove = state.nodes.find(node => node.id === chatId);
        if (!chatToMove || chatToMove.type !== EntityEnum.Chat) {
          throw new Error('Chat not found');
        }

        // Store original state for rollback
        const originalNodes = [...state.nodes];
        const originalChildrenOf = { ...state.childrenOf };
        const originalParentOf = { ...state.parentOf };

        // Get the actual current parent from the store state
        const actualSourceParentId = state.parentOf[chatId] || 'root';
        const targetParentId = targetParentFolderId || 'root';

        // Don't move if already in the target location
        if (actualSourceParentId === targetParentId) return;

        // Optimistic update
        set(state => {
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Remove from actual source parent's children
          if (updatedChildrenOf[actualSourceParentId]) {
            updatedChildrenOf[actualSourceParentId] = updatedChildrenOf[
              actualSourceParentId
            ].filter(id => id !== chatId);
          }

          // Add to target parent's children
          if (updatedChildrenOf[targetParentId]) {
            updatedChildrenOf[targetParentId] = [
              chatId,
              ...updatedChildrenOf[targetParentId],
            ];
          } else {
            updatedChildrenOf[targetParentId] = [chatId];
          }

          // Update parent relationship
          updatedParentOf[chatId] = targetParentId;

          // Update the node's parent_directory_id
          const updatedNodes = state.nodes.map(node =>
            node.id === chatId
              ? { ...node, parent_directory_id: targetParentFolderId }
              : node
          );

          return {
            ...state,
            nodes: updatedNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });

        try {
          // Make API call
          await ChatsService.updateChatDetails(chatId, {
            name: chatToMove.name,
            folder_id: targetParentFolderId,
          });

          // Invalidate caches
          await mutate(
            CACHE_KEYS.chats.byParentId(sourceParentFolderId, _sourceParentChatId),
            undefined,
            {
              revalidate: true,
            }
          );
          await mutate(CACHE_KEYS.chats.byParentId(targetParentFolderId), undefined, {
            revalidate: true,
          });
          await mutate(CACHE_KEYS.chats.breadcrumbs(chatId), undefined, {
            revalidate: true,
          });
        } catch (error) {
          // Rollback on error
          set({
            nodes: originalNodes,
            childrenOf: originalChildrenOf,
            parentOf: originalParentOf,
          });
          throw error;
        }
      },

      moveFolder: async (folderId, sourceParentFolderId, targetParentFolderId) => {
        if (sourceParentFolderId === targetParentFolderId) return;

        const state = get();

        // Find the folder to move
        const folderToMove = state.nodes.find(node => node.id === folderId);
        if (!folderToMove) {
          throw new Error('Folder not found');
        }

        // Store original state for rollback
        const originalNodes = [...state.nodes];
        const originalChildrenOf = { ...state.childrenOf };
        const originalParentOf = { ...state.parentOf };

        // Get the actual current parent from the store state
        const actualSourceParentId = state.parentOf[folderId] || 'root';
        const targetParentId = targetParentFolderId || 'root';

        // Don't move if already in the target location
        if (actualSourceParentId === targetParentId) return;

        // Optimistic update
        set(state => {
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Remove from actual source parent's children
          if (updatedChildrenOf[actualSourceParentId]) {
            updatedChildrenOf[actualSourceParentId] = updatedChildrenOf[
              actualSourceParentId
            ].filter(id => id !== folderId);
          }

          // Add to target parent's children
          if (updatedChildrenOf[targetParentId]) {
            updatedChildrenOf[targetParentId] = [
              folderId,
              ...updatedChildrenOf[targetParentId],
            ];
          } else {
            updatedChildrenOf[targetParentId] = [folderId];
          }

          // Update parent relationship
          updatedParentOf[folderId] = targetParentId;

          // Update the node's parent_id
          const updatedNodes = state.nodes.map(node =>
            node.id === folderId ? { ...node, parent_id: targetParentFolderId } : node
          );

          return {
            ...state,
            nodes: updatedNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });

        try {
          // Make API call
          await DirectoriesService.moveDirectory(folderId, {
            target_parent_id: targetParentFolderId ?? null,
          });

          // Invalidate caches
          await mutate(
            CACHE_KEYS.directories.byParentId(sourceParentFolderId),
            undefined,
            {
              revalidate: true,
            }
          );
          await mutate(
            CACHE_KEYS.directories.byParentId(targetParentFolderId),
            undefined,
            {
              revalidate: true,
            }
          );
          await mutate(findCacheKeysByPattern(['breadcrambs', '*']), undefined, {
            revalidate: true,
          });
        } catch (error) {
          // Rollback on error
          set({
            nodes: originalNodes,
            childrenOf: originalChildrenOf,
            parentOf: originalParentOf,
          });
          throw error;
        }
      },

      createTemporaryFolder: parentFolderId => {
        const newId = uuidv4();
        const parentId = parentFolderId || 'root';

        // Create temporary directory node with empty name
        const newDirectory: Node = {
          id: newId,
          name: '', // Empty name for inline editing
          type: EntityEnum.Folder,
          has_children: false,
        };

        // Add to state immediately (optimistic)
        set(state => {
          const updatedNodes = [newDirectory, ...state.nodes];
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Add to parent's children list at the beginning
          if (updatedChildrenOf[parentId]) {
            updatedChildrenOf[parentId] = [newId, ...updatedChildrenOf[parentId]];
          } else {
            updatedChildrenOf[parentId] = [newId];
          }

          // Set parent relationship
          updatedParentOf[newId] = parentId;

          return {
            ...state,
            nodes: updatedNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });

        useInlineEditStore.getState().startEditing(newId);

        return newId;
      },

      finalizeFolderCreation: async (id, name, parentFolderId) => {
        const parentId = parentFolderId || 'root';

        // Update the directory name
        set(state => ({
          ...state,
          nodes: state.nodes.map(node => (node.id === id ? { ...node, name } : node)),
        }));

        try {
          // Create directory on server
          await DirectoriesService.createDirectory({
            id,
            name,
            parent_folder_id: parentFolderId,
          });

          // Initialize empty child caches for the new directory
          await mutate(['directories', id], [], { revalidate: false });
          await mutate(['chats', 'directories', id], [], { revalidate: false });

          // Update parent's has_children flag if needed
          if (parentFolderId) {
            set(state => ({
              ...state,
              nodes: state.nodes.map(node =>
                node.id === parentFolderId ? { ...node, has_children: true } : node
              ),
            }));
          }

          // Revalidate breadcrumb caches
          await mutate(findCacheKeysByPattern(['breadcrumbs']));

          // Stop inline editing after successful creation
          useInlineEditStore.getState().stopEditing();
        } catch (error) {
          // Remove temporary directory on error
          set(state => {
            const updatedNodes = state.nodes.filter(node => node.id !== id);
            const updatedChildrenOf = { ...state.childrenOf };
            const updatedParentOf = { ...state.parentOf };

            // Remove from parent's children list
            if (updatedChildrenOf[parentId]) {
              updatedChildrenOf[parentId] = updatedChildrenOf[parentId].filter(
                childId => childId !== id
              );
            }

            // Remove from parentOf mapping
            delete updatedParentOf[id];

            return {
              ...state,
              nodes: updatedNodes,
              childrenOf: updatedChildrenOf,
              parentOf: updatedParentOf,
            };
          });

          throw error;
        }
      },

      removeTemporaryFolder: (id, parentFolderId) => {
        const parentId = parentFolderId || 'root';

        // Stop inline editing if this directory is being edited
        const inlineEditStore = useInlineEditStore.getState();
        if (inlineEditStore.isEditing(id)) {
          inlineEditStore.stopEditing();
        }

        // Remove temporary directory from state
        set(state => {
          const updatedNodes = state.nodes.filter(node => node.id !== id);
          const updatedChildrenOf = { ...state.childrenOf };
          const updatedParentOf = { ...state.parentOf };

          // Remove from parent's children list
          if (updatedChildrenOf[parentId]) {
            updatedChildrenOf[parentId] = updatedChildrenOf[parentId].filter(
              childId => childId !== id
            );
          }

          // Remove from parentOf mapping
          delete updatedParentOf[id];

          return {
            ...state,
            nodes: updatedNodes,
            childrenOf: updatedChildrenOf,
            parentOf: updatedParentOf,
          };
        });
      },

      // Loading state helpers
      isParentLoading: (parentId: string | 'root') => {
        return get().isLoadingParentIds.includes(parentId);
      },
    }),
    {
      name: 'file-system-store',
    }
  )
);
