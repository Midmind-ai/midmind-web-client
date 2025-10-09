import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useExpandedNodesStore } from '@features/file-system/stores/expanded-nodes.store';
import { useInlineEditStore } from '@features/file-system/stores/inline-edit.store';
import { findCacheKeysByPattern, CACHE_KEYS } from '@hooks/cache-keys';
import { mutate } from '@lib/swr';
import {
  ItemTypeEnum,
  type Item,
  type ItemsListResult,
} from '@services/items/items-dtos';
import { ItemsService } from '@services/items/items-service';
import type { ChatBranchContext } from '@shared-types/entities';
import {
  calculateInsertPosition,
  sortItemsByPosition,
  POSITION_GAP,
} from '@utils/position-calculator';

// Type for items grouped by parent
type ItemsByParentId = Record<string | 'root', Item[]>;

// Helper functions for item operations
const findItemLocation = (itemsByParentId: ItemsByParentId, itemId: string) => {
  for (const [parentId, items] of Object.entries(itemsByParentId)) {
    const item = items.find(i => i.id === itemId);
    if (item) {
      return { item, parentId: parentId as string | 'root' };
    }
  }

  return null;
};

const removeItemFromParent = (
  itemsByParentId: ItemsByParentId,
  parentId: string | 'root',
  itemId: string
): ItemsByParentId => {
  return {
    ...itemsByParentId,
    [parentId]: itemsByParentId[parentId]?.filter(item => item.id !== itemId) || [],
  };
};

const addItemToParent = (
  itemsByParentId: ItemsByParentId,
  parentId: string | 'root',
  item: Item
): ItemsByParentId => {
  // Ensure no duplicates and insert at correct position
  const existingItems = (itemsByParentId[parentId] || []).filter(i => i.id !== item.id);

  return {
    ...itemsByParentId,
    [parentId]: sortItemsByPosition([...existingItems, item]),
  };
};

const calculateDefaultPosition = (
  targetSiblings: Item[],
  excludeItemId: string
): number => {
  const siblings = targetSiblings.filter(item => item.id !== excludeItemId);

  return calculateInsertPosition(siblings, 0);
};

const invalidateMoveRelatedCaches = async (
  sourceParentId: string | 'root',
  targetParentId: string | 'root'
) => {
  const promises = [
    mutate(CACHE_KEYS.chats.byParentId(sourceParentId), undefined, { revalidate: true }),
    mutate(CACHE_KEYS.chats.byParentId(targetParentId), undefined, { revalidate: true }),
    mutate(findCacheKeysByPattern(['breadcrumbs']), undefined, { revalidate: true }),
  ];

  await Promise.all(promises);
};

// Simplified store state - no more complex Node type!
type FileSystemStore = {
  // Items grouped by parent ID - single source of truth
  itemsByParentId: ItemsByParentId;

  // Loading state
  isLoadingParentIds: Set<string | 'root'>;
  hasLoadedParentIds: Set<string | 'root'>;
  loadErrors: Record<string, Error | undefined>;

  // Single loading method (replaces 3 complex methods)
  loadItems: (parentId: string | null) => Promise<void>;

  // CRUD operations (already unified from previous work)
  setItemName: (nodeId: string, newName: string) => VoidFunction;
  renameItem: (nodeId: string, newName: string) => void;
  deleteItem: (id: string, parentId?: string) => Promise<void>;
  moveItem: (
    itemId: string,
    targetParentId: string | null,
    targetPosition?: number
  ) => Promise<void>;
  renormalizePositions: (parentId: string | null) => Promise<void>;

  // Chat creation
  createChat: (args: {
    newChatId?: string;
    openInSplitScreen?: boolean;
    parentChatId?: string;
    parentFolderId?: string;
    branchContext?: ChatBranchContext;
    navigate?: (chatId: string) => void;
  }) => Promise<string>;

  // Item creation (folders, notes, etc.)
  createTemporaryItem: (itemType: ItemTypeEnum, parentId?: string) => string;
  finalizeItemCreation: (
    id: string,
    name: string,
    itemType: ItemTypeEnum,
    parentId?: string
  ) => Promise<void>;
  removeTemporaryItem: (id: string, parentId?: string) => void;

  // Project-specific operations
  convertItemType: (itemId: string, targetType: ItemTypeEnum) => Promise<void>;
  getDescendants: (itemId: string) => Promise<Item[]>;

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
              [actualParentId]: sortItemsByPosition(result.items),
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

      setItemName: (nodeId, newName) => {
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

        return () => {
          set(state);
        };
      },

      renameItem: async (nodeId, newName) => {
        get().setItemName(nodeId, newName);

        await ItemsService.renameItem(nodeId, newName);
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

      moveItem: async (itemId, targetParentId, targetPosition) => {
        const state = get();

        // 1. Find the item to move
        const location = findItemLocation(state.itemsByParentId, itemId);
        if (!location) {
          throw new Error('Item not found');
        }

        const { item: itemToMove, parentId: sourceParentId } = location;
        const targetParent = targetParentId || 'root';

        // 2. Calculate position
        const position =
          targetPosition ??
          calculateDefaultPosition(state.itemsByParentId[targetParent] || [], itemId);

        // 3. Create moved item with new properties
        const movedItem: Item = {
          ...itemToMove,
          parent_id: targetParentId,
          position,
        };

        // 4. Save original state for rollback
        const originalState = { ...state.itemsByParentId };

        // 5. Optimistic update - clear and simple
        set(state => {
          let updated = { ...state.itemsByParentId };

          // Remove from source
          updated = removeItemFromParent(updated, sourceParentId, itemId);

          // Add to target (with duplicate prevention built-in)
          updated = addItemToParent(updated, targetParent, movedItem);

          return { itemsByParentId: updated };
        });

        // 6. Sync with backend
        try {
          await ItemsService.moveItem(itemId, {
            parent_id: targetParentId,
            position,
          });

          // Invalidate relevant caches
          await invalidateMoveRelatedCaches(sourceParentId, targetParent);
        } catch (error) {
          // Rollback on error
          set({ itemsByParentId: originalState });
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

        // Calculate position for the new chat
        const siblings = state.itemsByParentId[parentId] || [];
        const position = calculateInsertPosition(siblings, 0); // Insert at beginning

        // Create optimistic chat item
        const optimisticChat: Item = {
          id: chatId,
          type: 'chat',
          parent_id: parentChatId || parentFolderId || null,
          root_item_id: null,
          user_id: 'current-user',
          position,
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
            [parentId]: sortItemsByPosition([
              optimisticChat,
              ...(state.itemsByParentId[parentId] || []),
            ]),
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
          await ItemsService.createItem({
            type: ItemTypeEnum.Chat,
            id: chatId,
            name: 'Untitled chat',
            parent_id: parentChatId || parentFolderId || null,
            position,
            payload: { name: 'Untitled chat' },
          });

          return chatId;
        } catch (error) {
          // Rollback
          set({
            itemsByParentId: originalItemsByParentId,
          });
          throw error;
        }
      },

      createTemporaryItem: (itemType, parentId) => {
        const newId = uuidv4();
        const actualParentId = parentId || 'root';

        const state = get();
        const siblings = state.itemsByParentId[actualParentId] || [];
        const position = calculateInsertPosition(siblings, 0); // Insert at beginning

        // Create temporary item
        const newItem: Item = {
          id: newId,
          type: itemType,
          parent_id: parentId || null,
          root_item_id: null,
          user_id: 'current-user',
          position,
          created_at: new Date().toISOString(),
          updated_at: null,
          payload: { name: '' },
        };

        // Add to state immediately
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [actualParentId]: sortItemsByPosition([
              newItem,
              ...(state.itemsByParentId[actualParentId] || []),
            ]),
          },
        }));

        useInlineEditStore.getState().startEditing(newId);

        return newId;
      },

      finalizeItemCreation: async (id, name, itemType, parentId) => {
        const actualParentId = parentId || 'root';

        // Update item name
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [actualParentId]: (state.itemsByParentId[actualParentId] || []).map(item =>
              item.id === id ? { ...item, payload: { ...item.payload, name } } : item
            ),
          },
        }));

        // Get the temporary item to extract its calculated position
        const state = get();
        const tempItem = state.itemsByParentId[actualParentId]?.find(
          item => item.id === id
        );
        const position = tempItem?.position || POSITION_GAP;

        try {
          await ItemsService.createItem({
            id,
            name,
            payload: { name },
            parent_id: parentId,
            position,
            type: itemType,
          });
        } catch (error) {
          // Remove temporary item on error
          set(state => ({
            itemsByParentId: {
              ...state.itemsByParentId,
              [actualParentId]: (state.itemsByParentId[actualParentId] || []).filter(
                item => item.id !== id
              ),
            },
          }));

          throw error;
        } finally {
          // Stop inline editing
          useInlineEditStore.getState().stopEditing();
        }
      },

      removeTemporaryItem: (id, parentId) => {
        const actualParentId = parentId || 'root';

        // Stop inline editing
        const inlineEditStore = useInlineEditStore.getState();
        if (inlineEditStore.isEditing(id)) {
          inlineEditStore.stopEditing();
        }

        // Remove from state
        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [actualParentId]: (state.itemsByParentId[actualParentId] || []).filter(
              item => item.id !== id
            ),
          },
        }));
      },

      renormalizePositions: async parentId => {
        try {
          const response = await ItemsService.renormalizePositions(parentId);

          // Update positions in store with server response
          const actualParentId = parentId || 'root';

          set(state => {
            const currentItems = state.itemsByParentId[actualParentId] || [];
            const updatedItems = currentItems.map(item => {
              // Find the position update for this item ID
              const positionUpdate = response.items.find(updateObj =>
                Object.prototype.hasOwnProperty.call(updateObj, item.id)
              );
              const newPosition = positionUpdate
                ? positionUpdate[item.id]
                : item.position;

              return { ...item, position: newPosition };
            });

            return {
              itemsByParentId: {
                ...state.itemsByParentId,
                [actualParentId]: sortItemsByPosition(updatedItems),
              },
            };
          });
        } catch (error) {
          console.error('Failed to renormalize positions:', error);
          throw error;
        }
      },

      convertItemType: async (itemId, targetType) => {
        const state = get();

        // Find the item to convert
        const location = findItemLocation(state.itemsByParentId, itemId);
        if (!location) {
          throw new Error('Item not found');
        }

        const { item: originalItem, parentId } = location;

        // Store original state for rollback
        const originalItemsByParentId = { ...state.itemsByParentId };

        // Optimistic update - change the item type
        const convertedItem: Item = {
          ...originalItem,
          type: targetType,
        };

        set(state => ({
          itemsByParentId: {
            ...state.itemsByParentId,
            [parentId]: state.itemsByParentId[parentId].map(item =>
              item.id === itemId ? convertedItem : item
            ),
          },
        }));

        try {
          // API call to convert item type
          const updatedItem = await ItemsService.convertItemType(itemId, {
            type: targetType,
          });

          // Update with server response
          set(state => ({
            itemsByParentId: {
              ...state.itemsByParentId,
              [parentId]: state.itemsByParentId[parentId].map(item =>
                item.id === itemId ? updatedItem : item
              ),
            },
          }));

          // Revalidate breadcrumb caches since project/folder conversion affects navigation
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set({ itemsByParentId: originalItemsByParentId });
          throw error;
        }
      },

      getDescendants: async itemId => {
        try {
          const response = await ItemsService.getDescendants(itemId);

          return response.items;
        } catch (error) {
          console.error('Failed to get descendants:', error);
          throw error;
        }
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
