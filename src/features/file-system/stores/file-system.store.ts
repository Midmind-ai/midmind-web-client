import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useExpandedNodesStore } from '@features/file-system/stores/expanded-nodes.store';
import { useInlineEditStore } from '@features/file-system/stores/inline-edit.store';
import { findCacheKeysByPattern, CACHE_KEYS } from '@hooks/cache-keys';
import { mutate } from '@lib/swr';
import type { Item, ItemsListResult } from '@services/items/items-dtos';
import { ItemsService } from '@services/items/items-service';
import type { ChatBranchContext } from '@shared-types/entities';

// Simplified store state - no more complex Node type!
type FileSystemStore = {
  // Items grouped by parent ID - single source of truth
  itemsByParentId: Record<string | 'root', Item[]>;

  // Loading state
  isLoadingParentIds: Set<string | 'root'>;
  hasLoadedParentIds: Set<string | 'root'>;
  loadErrors: Record<string, Error | undefined>;

  // Single loading method (replaces 3 complex methods)
  loadItems: (parentId: string | null) => Promise<void>;

  // CRUD operations (already unified from previous work)
  renameItem: (nodeId: string, newName: string) => Promise<void>;
  deleteItem: (id: string, parentId?: string) => Promise<void>;
  moveItem: (itemId: string, targetParentId: string | null) => Promise<void>;

  // Chat creation
  createChat: (args: {
    newChatId?: string;
    openInSplitScreen?: boolean;
    parentChatId?: string;
    parentFolderId?: string;
    branchContext?: ChatBranchContext;
    navigate?: (chatId: string) => void;
  }) => Promise<string>;

  // Folder creation
  createTemporaryFolder: (parentFolderId?: string) => string;
  finalizeFolderCreation: (
    id: string,
    name: string,
    parentFolderId?: string
  ) => Promise<void>;
  removeTemporaryFolder: (id: string, parentFolderId?: string) => void;

  // Loading state helpers
  hasLoadAttempted: (parentId: string | 'root') => boolean;
  isParentLoading: (parentId: string | 'root') => boolean;
  getLoadError: (parentId: string | 'root') => Error | undefined;
  clearLoadError: (parentId: string | 'root') => void;
};

export const useFileSystemStore = create<FileSystemStore>()(
  devtools(
    (set, get) => ({
      // Simple initial state
      itemsByParentId: {},
      isLoadingParentIds: new Set(),
      hasLoadedParentIds: new Set(),
      loadErrors: {},

      loadItems: async (parentId: string | null = null) => {
        const actualParentId = parentId || 'root';

        // Check if already loading
        if (get().isLoadingParentIds.has(actualParentId)) {
          return;
        }

        try {
          // Set loading state and fetch data in one go
          set(state => ({
            ...state,
            isLoadingParentIds: new Set([...state.isLoadingParentIds, actualParentId]),
          }));

          let result: ItemsListResult;
          // Fetch data from API
          if (parentId) {
            result = await ItemsService.getItemChildren(parentId);
          } else {
            result = await ItemsService.getRootItems();
          }

          // Single state update with ALL changes - prevents cascading renders
          set(state => ({
            ...state,
            itemsByParentId: {
              ...state.itemsByParentId,
              [actualParentId]: result.items,
            },
            hasLoadedParentIds: new Set([...state.hasLoadedParentIds, actualParentId]),
            isLoadingParentIds: new Set(
              [...state.isLoadingParentIds].filter(id => id !== actualParentId)
            ),
            loadErrors: {
              ...state.loadErrors,
              [actualParentId]: undefined,
            },
          }));
        } catch (error) {
          // Single state update for error case - no cascading renders
          set(state => ({
            ...state,
            loadErrors: {
              ...state.loadErrors,
              [actualParentId]: error as Error,
            },
            hasLoadedParentIds: new Set([...state.hasLoadedParentIds, actualParentId]),
            isLoadingParentIds: new Set(
              [...state.isLoadingParentIds].filter(id => id !== actualParentId)
            ),
            // Set empty children on error
            itemsByParentId: {
              ...state.itemsByParentId,
              [actualParentId]: [],
            },
          }));

          throw error;
        }
      },

      renameItem: async (nodeId, newName) => {
        const state = get();
        // Find item across all parents
        let originalItem: Item | undefined;
        let foundParentId: string | 'root' | undefined;

        Object.entries(state.itemsByParentId).forEach(([pid, items]) => {
          const item = items.find(i => i.id === nodeId);
          if (item) {
            originalItem = item;
            foundParentId = pid;
          }
        });

        if (!originalItem || !foundParentId) {
          throw new Error('Item not found');
        }

        const parentId = foundParentId;

        // Optimistic update
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [parentId]: state.itemsByParentId[parentId].map(item =>
              item.id === nodeId
                ? { ...item, payload: { ...item.payload, name: newName } }
                : item
            ),
          },
        }));

        try {
          // API call
          const updatedItem = await ItemsService.renameItem(nodeId, newName);

          // Update with server response
          set(state => ({
            itemsByParentId: {
              ...state.itemsByParentId,
              [parentId]: state.itemsByParentId[parentId].map(item =>
                item.id === nodeId ? updatedItem : item
              ),
            },
          }));

          // Revalidate breadcrumb caches
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback
          if (originalItem) {
            set(state => ({
              itemsByParentId: {
                ...state.itemsByParentId,
                [parentId]: state.itemsByParentId[parentId]
                  .map(item => (item.id === nodeId ? originalItem : item))
                  .filter((item): item is Item => item !== undefined),
              },
            }));
          }
          throw error;
        }
      },

      deleteItem: async (id, parentId) => {
        const state = get();
        // Find item across all parents
        let item: Item | undefined;
        let foundParentId: string | 'root' | undefined;

        Object.entries(state.itemsByParentId).forEach(([pid, items]) => {
          const foundItem = items.find(i => i.id === id);
          if (foundItem) {
            item = foundItem;
            foundParentId = pid;
          }
        });

        const actualParentId = parentId || foundParentId || item?.parent_id || 'root';

        // Store original state for rollback
        const originalItemsByParentId = { ...state.itemsByParentId };

        // Optimistic update
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [actualParentId]: (state.itemsByParentId[actualParentId] || []).filter(
              item => item.id !== id
            ),
          },
        }));

        try {
          await ItemsService.deleteItem(id);

          // Clear related caches
          await mutate(['chat', id], undefined, { revalidate: false });
          await mutate(findCacheKeysByPattern(['messages', id]), undefined, {
            revalidate: false,
          });
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback
          set({
            itemsByParentId: originalItemsByParentId,
          });
          throw error;
        }
      },

      moveItem: async (itemId, targetParentId) => {
        const state = get();
        // Find item across all parents
        let itemToMove: Item | undefined;
        let sourceParentId: string | 'root' | undefined;

        Object.entries(state.itemsByParentId).forEach(([pid, items]) => {
          const item = items.find(i => i.id === itemId);
          if (item) {
            itemToMove = item;
            sourceParentId = pid;
          }
        });

        if (!itemToMove || !sourceParentId) {
          throw new Error('Item not found');
        }

        // Store as const to help TypeScript narrow the type in closures
        const itemToMoveConst: Item = itemToMove;
        const sourceParentIdConst: string | 'root' = sourceParentId;

        const actualTargetParentId = targetParentId || 'root';

        // Don't move if already in target location
        if (sourceParentIdConst === actualTargetParentId) return;

        const originalItemsByParentId = { ...state.itemsByParentId };

        // Optimistic update
        set(state => {
          const updatedItemsByParentId = { ...state.itemsByParentId };

          // Remove from source parent
          updatedItemsByParentId[sourceParentIdConst] = (
            state.itemsByParentId[sourceParentIdConst] || []
          ).filter(item => item.id !== itemId);

          // Update item's parent_id and add to target parent
          const movedItem: Item = { ...itemToMoveConst, parent_id: targetParentId };
          updatedItemsByParentId[actualTargetParentId] = [
            movedItem,
            ...(state.itemsByParentId[actualTargetParentId] || []),
          ];

          return {
            itemsByParentId: updatedItemsByParentId,
          };
        });

        try {
          await ItemsService.moveItem(itemId, { parent_id: targetParentId });

          // Invalidate caches
          await mutate(CACHE_KEYS.chats.byParentId(sourceParentId), undefined, {
            revalidate: true,
          });
          await mutate(CACHE_KEYS.chats.byParentId(actualTargetParentId), undefined, {
            revalidate: true,
          });
          await mutate(findCacheKeysByPattern(['breadcrumbs']), undefined, {
            revalidate: true,
          });
        } catch (error) {
          // Rollback
          set({
            itemsByParentId: originalItemsByParentId,
          });
          throw error;
        }
      },

      createChat: async ({
        newChatId,
        openInSplitScreen = false,
        parentChatId,
        parentFolderId,
        branchContext,
        navigate,
      }) => {
        const chatId = newChatId || uuidv4();
        const state = get();
        const originalItemsByParentId = { ...state.itemsByParentId };

        const parentId = parentChatId || parentFolderId || 'root';

        // Create optimistic chat item
        const optimisticChat: Item = {
          id: chatId,
          type: 'chat',
          parent_id: parentChatId || parentFolderId || null,
          root_item_id: null,
          user_id: 'current-user',
          created_at: new Date().toISOString(),
          updated_at: null,
          payload: {
            name: 'New chat',
            ...(branchContext && {
              chat_metadata: {
                parent_chat_id: parentChatId,
                parent_message_id: branchContext.parent_message_id,
                selected_text: branchContext.selected_text,
                start_position: branchContext.start_position,
                end_position: branchContext.end_position,
                connection_type: branchContext.connection_type,
                context_type: branchContext.context_type,
                connection_color: branchContext.connection_color,
              },
            }),
          },
        };

        // Optimistic update
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [parentId]: [optimisticChat, ...(state.itemsByParentId[parentId] || [])],
          },
        }));

        // Expand parent if this is a branch
        if (parentChatId) {
          const { expandNode } = useExpandedNodesStore.getState();
          expandNode(parentChatId);
        }

        // Handle split screen
        if (openInSplitScreen) {
          const { openChatInSplitView } = await import('@hooks/use-split-screen-actions');
          openChatInSplitView(chatId, parentChatId);
        }

        if (navigate) navigate(chatId);

        try {
          await ItemsService.createChat(
            'New chat',
            parentChatId || parentFolderId || null,
            optimisticChat.payload
          );

          return chatId;
        } catch (error) {
          // Rollback
          set({
            itemsByParentId: originalItemsByParentId,
          });
          throw error;
        }
      },

      createTemporaryFolder: parentFolderId => {
        const newId = uuidv4();
        const parentId = parentFolderId || 'root';

        // Create temporary folder item
        const newFolder: Item = {
          id: newId,
          type: 'folder',
          parent_id: parentFolderId || null,
          root_item_id: null,
          user_id: 'current-user',
          created_at: new Date().toISOString(),
          updated_at: null,
          payload: { name: '' },
        };

        // Add to state immediately
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [parentId]: [newFolder, ...(state.itemsByParentId[parentId] || [])],
          },
        }));

        useInlineEditStore.getState().startEditing(newId);

        return newId;
      },

      finalizeFolderCreation: async (id, name, parentFolderId) => {
        const parentId = parentFolderId || 'root';

        // Update folder name
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [parentId]: (state.itemsByParentId[parentId] || []).map(item =>
              item.id === id ? { ...item, payload: { ...item.payload, name } } : item
            ),
          },
        }));

        try {
          await ItemsService.createFolder(name, parentFolderId);

          // Stop inline editing
          useInlineEditStore.getState().stopEditing();
        } catch (error) {
          // Remove temporary folder on error
          set(state => ({
            itemsByParentId: {
              ...state.itemsByParentId,
              [parentId]: (state.itemsByParentId[parentId] || []).filter(
                item => item.id !== id
              ),
            },
          }));

          throw error;
        }
      },

      removeTemporaryFolder: (id, parentFolderId) => {
        const parentId = parentFolderId || 'root';

        // Stop inline editing
        const inlineEditStore = useInlineEditStore.getState();
        if (inlineEditStore.isEditing(id)) {
          inlineEditStore.stopEditing();
        }

        // Remove from state
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [parentId]: (state.itemsByParentId[parentId] || []).filter(
              item => item.id !== id
            ),
          },
        }));
      },

      // Loading state helpers
      hasLoadAttempted: (parentId: string | 'root') => {
        return get().hasLoadedParentIds.has(parentId);
      },

      isParentLoading: (parentId: string | 'root') => {
        return get().isLoadingParentIds.has(parentId);
      },

      getLoadError: (parentId: string | 'root') => {
        return get().loadErrors[parentId];
      },

      clearLoadError: (parentId: string | 'root') => {
        set(state => ({
          loadErrors: {
            ...state.loadErrors,
            [parentId]: undefined,
          },
          hasLoadedParentIds: new Set(
            Array.from(state.hasLoadedParentIds).filter(id => id !== parentId)
          ),
          isLoadingParentIds: new Set(
            Array.from(state.isLoadingParentIds).filter(id => id !== parentId)
          ),
        }));
      },
    }),
    {
      name: 'file-system-store',
    }
  )
);
