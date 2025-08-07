import type { components } from '@shared/services/types/generated';

export type ConversationWithAIRequestDto = components['schemas']['CreateConversationDto'];

export type ConversationWithAIResponseDto =
  components['schemas']['CreateConversationResponseContentDto'];
