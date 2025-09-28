import { v4 as uuidv4 } from 'uuid';
import type {
  Item,
  ItemListResponse,
  CreateItemRequest,
  MoveItemRequest,
  ListItemsOptions,
  ItemsListResult,
  MoveTreeItemRequest,
  CreateTreeItemRequest,
  RenormalizeResponse,
} from './items-dtos';
import { baseAxiosInstance } from '@config/axios';

export class ItemsService {
  /**
   * List items with optional filtering and pagination
   */
  static async getRootItems(options: ListItemsOptions = {}): Promise<ItemsListResult> {
    const { limit = 50, offset = 0 } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

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
      position: request.position,
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
      position: request.position,
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
   * Rename an item (works for all item types)
   */
  static async renameItem(itemId: string, name: string): Promise<Item> {
    const { data } = await baseAxiosInstance.patch<Item>(`/items/${itemId}/rename/`, {
      name,
    });

    return data;
  }

  /**
   * Renormalize positions when precision is exhausted
   */
  static async renormalizePositions(
    parentId: string | null
  ): Promise<RenormalizeResponse> {
    const pathParentId = parentId || 'root';
    const { data } = await baseAxiosInstance.post<RenormalizeResponse>(
      `/items/${pathParentId}/renormalize`
    );

    return data;
  }
}
