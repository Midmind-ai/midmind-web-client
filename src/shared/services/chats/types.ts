import type { components } from '@shared/services/types/generated';

export type UpdateChatDetailsRequest = components['schemas']['UpdateChatDto'];

export type SendMessageToChatRequest = components['schemas']['CreateMessageDto'];

export type SendMessageToChatResponse = components['schemas']['CreateMessageResponseContentDto'];
