import type { components } from 'generated/api-types';

export type User = components['schemas']['UserDto'];

export type Chat = components['schemas']['ChatDto'];

export type Directory = components['schemas']['GetDirectoryDto'];

export type ChatMessage = components['schemas']['AppMessageDto'];

export type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

export type ChatBranchContext = components['schemas']['CreateChatDto']['branch_context'];

export type ConversationBranchContext =
  components['schemas']['ConversationBranchContextDto'];

export type TreeItem = {
  id: string;
  name: string;
};

export enum EntityEnum {
  Folder = 'folder',
  Chat = 'chat',
  Mindlet = 'mindlet',
  Note = 'note',
}
