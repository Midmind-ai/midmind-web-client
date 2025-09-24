import { v4 as uuidv4 } from 'uuid';
import type {
  Item,
  ItemListResponse,
  CreateItemRequest,
  MoveItemRequest,
  ListItemsOptions,
  ItemsListResult,
  CreateTreeItemRequest,
  MoveTreeItemRequest,
} from './items-dtos';
import { ItemTypeEnum } from './items-dtos';
import { baseAxiosInstance } from '@config/axios';

export class ItemsService {
  /**
   * List items with optional filtering and pagination
   */
  static async listItems(options: ListItemsOptions = {}): Promise<ItemsListResult> {
    const { limit = 50, offset = 0, parent_id } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Only include parent_id if it's not null/undefined
    if (parent_id) {
      params.append('parent_id', parent_id);
    }

    const { data } = await baseAxiosInstance.get<ItemListResponse>(`/items`, {
      params: Object.fromEntries(params),
    });

    return {
      items: data.items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  }

  /**
   * Get a single item by ID
   */
  static async getItem(itemId: string): Promise<Item> {
    const { data } = await baseAxiosInstance.get<Item>(`/items/${itemId}`);

    return data;
  }

  /**
   * Get direct children of an item (for tree expansion)
   */
  static async getItemChildren(itemId: string): Promise<ItemsListResult> {
    const { data } = await baseAxiosInstance.get<ItemListResponse>(
      `/items/${itemId}/children`
    );

    return {
      items: data.items,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    };
  }

  /**
   * Create a new item
   */
  static async createItem(request: CreateTreeItemRequest): Promise<Item> {
    const createRequest: CreateItemRequest = {
      id: request.id || uuidv4(),
      type: request.type,
      parent_id: request.parent_id,
      payload: request.payload as CreateItemRequest['payload'],
    };

    const { data } = await baseAxiosInstance.post<Item>('/items', createRequest);

    return data;
  }

  /**
   * Move an item to a new parent
   */
  static async moveItem(itemId: string, request: MoveTreeItemRequest): Promise<Item> {
    const moveRequest: MoveItemRequest = {
      parent_id: request.parent_id,
    };

    const { data } = await baseAxiosInstance.patch<Item>(
      `/items/${itemId}/move`,
      moveRequest
    );

    return data;
  }

  /**
   * Delete an item and all its children
   */
  static async deleteItem(itemId: string): Promise<void> {
    await baseAxiosInstance.delete(`/items/${itemId}`);
  }

  /**
   * Get root items (items with no parent)
   */
  static async getRootItems(
    options: Omit<ListItemsOptions, 'parent_id'> = {}
  ): Promise<ItemsListResult> {
    return this.listItems({ ...options, parent_id: null });
  }

  /**
   * Get items by parent ID (convenience method for tree loading)
   */
  static async getItemsByParent(
    parentId: string | null,
    options: Omit<ListItemsOptions, 'parent_id'> = {}
  ): Promise<ItemsListResult> {
    return this.listItems({ ...options, parent_id: parentId });
  }

  /**
   * Create a folder item
   */
  static async createFolder(
    id: string,
    name: string,
    parentId?: string | null
  ): Promise<Item> {
    return await this.createItem({
      name,
      id,
      type: ItemTypeEnum.Folder,
      parent_id: parentId,
      payload: { name },
    });
  }

  /**
   * Create a chat item
   */
  static async createChat(
    name: string,
    parentId?: string | null,
    payload?: Record<string, unknown>
  ): Promise<Item> {
    return await this.createItem({
      name,
      type: ItemTypeEnum.Chat,
      parent_id: parentId,
      payload: {
        name,
        depth: 0,
        position_x: 0,
        position_y: 0,
        ...payload,
      },
    });
  }

  /**
   * Create a note item
   */
  static async createNote(
    name: string,
    parentId?: string | null,
    payload?: Record<string, unknown>
  ): Promise<Item> {
    return this.createItem({
      name,
      type: ItemTypeEnum.Note,
      parent_id: parentId,
      payload: {
        name,
        content_md: null,
        content_json: null,
        ...payload,
      },
    });
  }

  /**
   * Rename an item (works for all item types)
   */
  static async renameItem(itemId: string, name: string): Promise<Item> {
    const { data } = await baseAxiosInstance.patch<Item>(`/items/${itemId}/rename/`, {
      name,
    });

    return data;
  }
}
