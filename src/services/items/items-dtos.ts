import type { components } from 'generated/api-types-new';

// Base types from API
export type ItemType = components['schemas']['ItemType'];
export type ItemResponse = components['schemas']['ItemResponse'];
export type ItemListResponse = components['schemas']['ItemListResponse'];
export type CreateItemRequest = components['schemas']['CreateItemRequest'];
export type MoveItemRequest = components['schemas']['MoveItemRequest'];

// Convenience type aliases
export type Item = ItemResponse;

// Tree-specific types for easier usage
export interface TreeItem extends Item {
  // Add computed properties for tree operations
  hasChildren: boolean;
  isExpanded?: boolean;
}

// Request types for tree operations
export interface CreateTreeItemRequest {
  id?: string;
  name: string;
  type: ItemType;
  parent_id?: string | null;
  payload?: Record<string, unknown>;
}

export interface MoveTreeItemRequest {
  parent_id: string | null;
}

// List options for items service
export interface ListItemsOptions {
  limit?: number;
  offset?: number;
  parent_id?: string | null;
}

// Response wrapper for better type safety
export interface ItemsListResult {
  items: Item[];
  total: number;
  limit: number;
  offset: number;
}

// Helper type for tree operations
export interface ItemWithChildren extends Item {
  children?: Item[];
  childrenLoaded?: boolean;
}
