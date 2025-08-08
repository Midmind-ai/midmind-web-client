import type { components } from '@shared/services/types/generated';

export type User = components['schemas']['UserDto'];

export type Chat = components['schemas']['ChatDto'];

export type ChatMessage = components['schemas']['AppMessageDto'];

export type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

export type ThreadContext = components['schemas']['ConversationThreadContextDto'];
