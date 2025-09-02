import type { components } from 'generated/api-types';

export type User = components['schemas']['UserDto'];

export type Chat = components['schemas']['ChatDto'] & { type: EntityEnum };

export type Directory = components['schemas']['GetFolderDto'] & { type: EntityEnum };

export type ChatMessage = components['schemas']['AppMessageDto'];

export type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

export type ChatBranchContext = components['schemas']['CreateChatDto']['chat_metadata'];

export type ConversationBranchContext =
  components['schemas']['ChatMetadataByMessageIdDto'];

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
