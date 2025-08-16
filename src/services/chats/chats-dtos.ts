import type { components } from 'generated/api-types';

export type UpdateChatDetailsRequestDto = components['schemas']['UpdateChatDto'];

export type MoveChatDto = {
  parentDirectoryId?: string | null;
};
