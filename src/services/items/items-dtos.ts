import type { components } from 'generated/api-types-new';

// Frontend ItemType enum - decoupled from backend string literals
export enum ItemTypeEnum {
  Note = 'note',
  Chat = 'chat',
  Folder = 'folder',
  Project = 'project',
  Prompt = 'prompt',
}

// Backend API type - keep for API compatibility
export type ApiItemType = components['schemas']['ItemType'];
export type ItemResponse = components['schemas']['ItemResponse'];
export type ItemListResponse = components['schemas']['ItemListResponse'];
export type CreateItemRequest = components['schemas']['CreateItemRequest'];
export type MoveItemRequest = components['schemas']['MoveItemRequest'];
export type ChildrenBounds = components['schemas']['ChildrenBounds'];
export type RenormalizeResponse = components['schemas']['RenormalizeResponse'];

// Convenience type aliases
export type Item = ItemResponse;
export type ItemPayload = ItemResponse['payload'];

// Type-specific payload aliases
export type NotePayload = components['schemas']['NotePayload'];
export type PromptPayload = components['schemas']['PromptPayload'];
export type ChatPayload = components['schemas']['ChatPayload'];
export type FolderPayload = components['schemas']['FolderPayload'];
export type ProjectPayload = components['schemas']['ProjectPayload'];

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
  type: ItemTypeEnum;
  parent_id?: string | null;
  payload?: ItemPayload;
  position: number;
}

export interface MoveTreeItemRequest {
  parent_id: string | null;
  position: number;
}

// Rename request type (until backend generates it)
export interface RenameItemRequest {
  name: string;
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

// Project-specific types (manual definitions until API types are updated)
export interface ConvertItemRequest {
  type: ItemTypeEnum;
}

export interface ItemDescendantsResponse {
  parent_id: string;
  items: Item[];
  total_count: number;
  has_projects: boolean;
}

// Type guard helpers
export function isNotePayload(payload: ItemPayload | undefined): payload is NotePayload {
  return !!payload && ('content_json' in payload || 'content_md' in payload);
}

export function hasContentJson(
  payload: ItemPayload | undefined
): payload is NotePayload | PromptPayload {
  return !!payload && 'content_json' in payload;
}
