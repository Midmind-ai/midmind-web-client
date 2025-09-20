import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useExpandedNodesStore } from '@features/file-system/stores/expanded-nodes.store';
import { useInlineEditStore } from '@features/file-system/stores/inline-edit.store';
import { findCacheKeysByPattern, CACHE_KEYS } from '@hooks/cache-keys';
import { mutate } from '@lib/swr';
import type { Item, ItemType } from '@services/items/items-dtos';
import { ItemsService } from '@services/items/items-service';
import { EntityEnum } from '@shared-types/entities';
import type { Directory, Chat, ChatBranchContext } from '@shared-types/entities';

// Updated Node type to support both old and new structures
type Node = {
  id: string;
  type: EntityEnum | ItemType;
  // Common properties that should exist on all nodes
  name?: string;
  has_children?: boolean;
  // Legacy properties
  parent_directory_id?: string | null;
  parent_chat_id?: string | null;
  parent_folder_id?: string | null;
  // New item properties
  parent_id?: string | null;
  root_item_id?: string | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string | null;
  payload?: Record<string, unknown>;
};

type FileSystemStoreType = {
  nodes: Array<Node>;
  childrenOf: Record<string | 'root', string[]>;
  parentOf: Record<string, string | 'root'>;
  loadErrors: Record<string, Error | undefined>; // Track load errors by parentId
  hasLoadedParentIds: Set<string | 'root'>; // Track which parents have been loaded (success or error)
  isLoadingParentIds: Set<string | 'root'>; // Track which parents are currently loading

  setNodes: (nodes: Array<Directory | Chat | Item>, parentId: string | 'root') => void;

  // New simplified data loading methods using ItemsService
  loadItems: (parentId?: string | 'root') => Promise<void>;
  loadItemChildren: (itemId: string) => Promise<void>;
  loadData: (parentId?: string | 'root', parentType?: EntityEnum) => Promise<void>;

  createChat: (args: {
    newChatId?: string;
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
  hasLoadAttempted: (parentId: string | 'root') => boolean;
  isParentLoading: (parentId: string | 'root') => boolean;
  getLoadError: (parentId: string | 'root') => Error | undefined;
  clearLoadError: (parentId: string | 'root') => void;
};

export const useFileSystemStore = create<FileSystemStoreType>()(
  devtools(
    (set, get) => ({
      nodes: [],
      childrenOf: {},
      parentOf: {},
      loadErrors: {},
      hasLoadedParentIds: new Set(),
      isLoadingParentIds: new Set(),

      setNodes: (newNodes, parentId = 'root') => {
        set(state => {
          // Get IDs of new nodes
          const newNodeIds = new Set(newNodes.map(node => node.id));

          // Remove any existing nodes with the same IDs (to prevent duplicates)
          const existingNodesWithoutDuplicates = state.nodes.filter(
            node => !newNodeIds.has(node.id)
          );

          // Convert new nodes to proper Node format
          const typedNewNodes: Node[] = newNodes.map(node => {
            const nodeType =
              node.type ||
              ('entity_type' in node
                ? (node as unknown as { entity_type: EntityEnum }).entity_type
                : EntityEnum.Folder);

            return {
              id: node.id,
              type: nodeType,
              name:
                'name' in node
                  ? (node as { name: string }).name
                  : (node as { payload?: { name?: string } }).payload?.name || 'Untitled',
              has_children:
                'has_children' in node
                  ? (node as { has_children: boolean }).has_children
                  : false,
              parent_id:
                'parent_id' in node
                  ? (node as { parent_id: string | null }).parent_id
                  : undefined,
              parent_directory_id:
                'parent_directory_id' in node
                  ? (node as { parent_directory_id: string | null }).parent_directory_id
                  : undefined,
              parent_chat_id:
                'parent_chat_id' in node
                  ? (node as { parent_chat_id: string | null }).parent_chat_id
                  : undefined,
              parent_folder_id:
                'parent_folder_id' in node
                  ? (node as { parent_folder_id: string | null }).parent_folder_id
                  : undefined,
              root_item_id:
                'root_item_id' in node
                  ? (node as { root_item_id: string | null }).root_item_id
                  : undefined,
              user_id:
                'user_id' in node ? (node as { user_id: string }).user_id : undefined,
              created_at:
                'created_at' in node
                  ? (node as { created_at: string }).created_at
                  : undefined,
              updated_at:
                'updated_at' in node
                  ? (node as { updated_at: string | null }).updated_at
                  : undefined,
              payload:
                'payload' in node
                  ? (node as { payload: Record<string, unknown> }).payload
                  : undefined,
            };
          });

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

      // New simplified data loading methods using ItemsService
      loadItems: async (parentId = 'root') => {
        // Set loading state
        set(state => ({
          ...state,
          isLoadingParentIds: new Set([...state.isLoadingParentIds, parentId]),
        }));

        try {
          // Convert 'root' to null for service call
          const serviceParentId = parentId === 'root' ? null : parentId;

          const result = await ItemsService.getItemsByParent(serviceParentId);

          // Convert items to nodes format
          const itemsAsNodes = result.items.map(item => ({
            ...item,
            type: item.type as EntityEnum,
            name: item.payload?.name || `Untitled ${item.type}`,
            has_children: false, // Will be updated by server if needed
          }));

          // Update store with loaded items
          const state = get();
          const existingNodes = state.nodes.filter(
            node => state.parentOf[node.id] !== parentId
          );

          set(state => ({
            ...state,
            nodes: [...existingNodes, ...itemsAsNodes],
            childrenOf: {
              ...state.childrenOf,
              [parentId]: itemsAsNodes.map(item => item.id),
            },
            parentOf: {
              ...state.parentOf,
              ...itemsAsNodes.reduce(
                (acc, item) => ({ ...acc, [item.id]: parentId }),
                {}
              ),
            },
            // Clear any previous error for this parentId
            loadErrors: {
              ...state.loadErrors,
              [parentId]: undefined,
            },
            // Mark as loaded
            hasLoadedParentIds: new Set([...state.hasLoadedParentIds, parentId]),
            // Clear loading state
            isLoadingParentIds: new Set(
              Array.from(state.isLoadingParentIds).filter(id => id !== parentId)
            ),
          }));
        } catch (error) {
          // Mark as loaded with error
          set(state => ({
            ...state,
            // Set empty children to prevent re-triggering
            childrenOf: {
              ...state.childrenOf,
              [parentId]: [],
            },
            // Store the error
            loadErrors: {
              ...state.loadErrors,
              [parentId]: error as Error,
            },
            // Mark as loaded (even though it failed)
            hasLoadedParentIds: new Set([...state.hasLoadedParentIds, parentId]),
            // Clear loading state
            isLoadingParentIds: new Set(
              Array.from(state.isLoadingParentIds).filter(id => id !== parentId)
            ),
          }));

          throw error;
        }
      },

      loadItemChildren: async (itemId: string) => {
        // Set loading state
        set(state => ({
          ...state,
          isLoadingParentIds: new Set([...state.isLoadingParentIds, itemId]),
        }));

        try {
          const result = await ItemsService.getItemChildren(itemId);

          // Convert items to nodes format
          const childrenAsNodes = result.items.map(item => ({
            ...item,
            type: item.type as EntityEnum,
            name: item.payload?.name || `Untitled ${item.type}`,
            has_children: false, // Will be updated by server if needed
          }));

          // Update store with loaded children
          const state = get();
          const existingNodes = state.nodes.filter(
            node => state.parentOf[node.id] !== itemId
          );

          set(state => ({
            ...state,
            nodes: [...existingNodes, ...childrenAsNodes],
            childrenOf: {
              ...state.childrenOf,
              [itemId]: childrenAsNodes.map(item => item.id),
            },
            parentOf: {
              ...state.parentOf,
              ...childrenAsNodes.reduce(
                (acc, item) => ({ ...acc, [item.id]: itemId }),
                {}
              ),
            },
            // Clear any previous error
            loadErrors: {
              ...state.loadErrors,
              [itemId]: undefined,
            },
            // Mark as loaded
            hasLoadedParentIds: new Set([...state.hasLoadedParentIds, itemId]),
            // Clear loading state
            isLoadingParentIds: new Set(
              Array.from(state.isLoadingParentIds).filter(id => id !== itemId)
            ),
          }));
        } catch (error) {
          // Mark as loaded with error
          set(state => ({
            ...state,
            // Set empty children to prevent re-triggering
            childrenOf: {
              ...state.childrenOf,
              [itemId]: [],
            },
            // Store the error
            loadErrors: {
              ...state.loadErrors,
              [itemId]: error as Error,
            },
            // Mark as loaded (even though it failed)
            hasLoadedParentIds: new Set([...state.hasLoadedParentIds, itemId]),
            // Clear loading state
            isLoadingParentIds: new Set(
              Array.from(state.isLoadingParentIds).filter(id => id !== itemId)
            ),
          }));

          throw error;
        }
      },

      loadData: async (parentId = 'root', _parentType?: EntityEnum) => {
        // Simplified: just load items for the given parent
        // The new API handles all item types (folders, chats, notes) in one call
        if (parentId === 'root') {
          await get().loadItems(parentId);
        } else {
          // For specific items, load their children
          await get().loadItemChildren(parentId);
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
        const originalNodes = [...state.nodes];
        const originalChildrenOf = { ...state.childrenOf };
        const originalParentOf = { ...state.parentOf };

        const parentId = parentChatId || parentFolderId || 'root';

        // Create optimistic chat object
        const optimisticChat: Node = {
          id: chatId,
          name: 'New chat',
          type: EntityEnum.Chat,
          parent_id: parentChatId || parentFolderId || null,
          has_children: false,
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

        // Handle split screen opening
        if (openInSplitScreen) {
          const { openChatInSplitView } = await import('@hooks/use-split-screen-actions');
          openChatInSplitView(chatId, parentChatId);
        }

        if (navigate) navigate(chatId);

        try {
          // Create the chat using the new ItemsService
          await ItemsService.createChat(
            'New chat',
            parentChatId || parentFolderId || null,
            optimisticChat.payload
          );

          return chatId;
        } catch (error) {
          set({
            nodes: originalNodes,
            childrenOf: originalChildrenOf,
            parentOf: originalParentOf,
          });

          throw error;
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
          // TODO: Update chat name using ItemsService
          // await ItemsService.updateItem(nodeId, { payload: { name: newName } });
          // Revalidate breadcrumb caches after successful rename
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set(state => ({
            ...state,
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, name: originalNode?.name } : node
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
          // TODO: Update folder name using ItemsService
          // await ItemsService.updateItem(nodeId, { payload: { name: newName } });
          // Revalidate breadcrumb caches after successful rename
          await mutate(findCacheKeysByPattern(['breadcrumbs']));
        } catch (error) {
          // Rollback on error
          set(state => ({
            ...state,
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, name: originalNode?.name } : node
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
          await ItemsService.deleteItem(id);

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
          await ItemsService.deleteItem(id);

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
              ? {
                  ...node,
                  parent_directory_id:
                    targetParentFolderId === 'root' ? null : targetParentFolderId,
                }
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
          await ItemsService.moveItem(chatId, {
            parent_id: targetParentFolderId === 'root' ? null : targetParentFolderId,
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
            node.id === folderId
              ? {
                  ...node,
                  parent_id:
                    targetParentFolderId === 'root' ? null : targetParentFolderId,
                }
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
          await ItemsService.moveItem(folderId, {
            parent_id:
              targetParentFolderId === 'root' ? null : targetParentFolderId || null,
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
          await ItemsService.createFolder(name, parentFolderId);

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
          ...state,
          loadErrors: {
            ...state.loadErrors,
            [parentId]: undefined,
          },
          // Remove from hasLoadedParentIds to allow retry
          hasLoadedParentIds: new Set(
            Array.from(state.hasLoadedParentIds).filter(id => id !== parentId)
          ),
          // Also clear loading state if it exists
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
