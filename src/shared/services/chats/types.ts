import type { components, operations } from '@shared/services/types/generated';

export type UpdateChatDetailsRequest = components['schemas']['UpdateChatDto'];

export type SendMessageToChatRequest = components['schemas']['CreateMessageDto'];

export type SendMessageToChatResponse = components['schemas']['CreateMessageResponseContentDto'];

export type GetChatMessagesParams =
  operations['MessageController_getChatMessages']['parameters']['query'];
