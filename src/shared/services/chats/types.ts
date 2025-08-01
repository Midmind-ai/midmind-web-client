import type { components, operations } from '@shared/services/types/generated';

export type UpdateChatDetailsRequest = components['schemas']['UpdateChatDto'];

export type ConversationWithAIRequest = components['schemas']['CreateConversationDto'];

export type ConversationWithAIResponse =
  components['schemas']['CreateConversationResponseContentDto'];

export type GetChatMessagesParams =
  operations['MessageController_getChatMessages']['parameters']['query'];
