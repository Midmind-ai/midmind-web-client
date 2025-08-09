import type { components } from 'generated/api-types';

export type User = components['schemas']['UserDto'];

export type Chat = components['schemas']['ChatDto'];

export type ChatMessage = components['schemas']['AppMessageDto'];

export type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

export type BranchContext = components['schemas']['ConversationBranchContextDto'];

export type TreeItem = {
  id: string;
  name: string;
};
