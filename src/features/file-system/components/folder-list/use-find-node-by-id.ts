import type { TreeNode } from '@features/file-system/hooks/use-tree-data';

import { useCacheUtils } from '@hooks/use-cache-utils';

import type { Chat, Directory } from '@shared-types/entities';

export const useFindNodeById = () => {
  const { findInCacheMultiple, extractParentFromCacheKey } = useCacheUtils();

  const findFolderNodeById = (id: string): TreeNode | null => {
    // Search both directories and chats in one call
    const result = findInCacheMultiple<Directory | Chat>(['directories', 'chats'], id);

    if (!result) {
      return null;
    }

    const { item, cacheKey, pattern } = result;
    const entityType = pattern === 'directories' ? 'directory' : 'chat';
    const parentDirectoryId = extractParentFromCacheKey(cacheKey, entityType);

    return {
      id: item.id,
      name: item.name,
      type: entityType,
      hasChildren: item.has_children,
      parentDirectoryId: parentDirectoryId || (item as Chat).parent_directory_id || null,
      originalData: item,
    };
  };

  return {
    findFolderNodeById,
  };
};
