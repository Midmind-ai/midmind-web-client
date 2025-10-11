import type { MessageResponse, MessageNestedChat } from '@services/chats/chats-dtos';
import type { components } from 'generated/api-types';
import type { components as componentsNew } from 'generated/api-types-new';

export type User = components['schemas']['UserDto'];

export type Chat = components['schemas']['ChatDto'] & { type: EntityEnum };

export type Directory = components['schemas']['GetFolderDto'] & { type: EntityEnum };

export type Project = {
  name: string;
  description?: string | null;
  type: EntityEnum;
};

// Using new MessageResponse type from chats-dtos (temporarily extended)
export type ChatMessage = MessageResponse;

export type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

// Using MessageNestedChat from chats-dtos
export type ChatBranchContext = MessageNestedChat;

export type ConversationBranchContext =
  components['schemas']['ChatMetadataByMessageIdDto'];

// Streaming related types
export type StreamChunk = components['schemas']['CreateConversationResponseContentDto'];

// Request types - keeping old for now
export type SendMessageRequest = components['schemas']['CreateConversationDto'];

// AI Model type - use LLModel enum from new generated API types
export type AIModel = componentsNew['schemas']['LLModel'];

export type TreeItem = {
  id: string;
  name: string;
};

export enum EntityEnum {
  Folder = 'folder',
  Chat = 'chat',
  Note = 'note',
  Project = 'project',
}
