import type { components } from 'generated/api-types-new';

// Temporary types until backend is updated
export type ReplyToDto = {
  id: string;
  content: string;
};

export type UpdateChatDetailsRequestDto = {
  name?: string;
};

export type CreateNewChatRequestDto = {
  name: string;
  parent_folder_id?: string | null;
};

// Temporary type definitions until backend adds these
export type MessageNestedChat = {
  id: string;
  child_chat_id: string;
  connection_type: string;
  connection_color: string;
  context_type: 'full_message' | 'text_selection';
  end_position: number | null;
  start_position: number | null;
  parent_message_id?: string;
  selected_text?: string;
};

export type MessageAttachment = {
  id: string;
  mime_type: string;
  original_filename: string;
};

// Message DTOs - using new API types
export type SendMessageRequest = components['schemas']['SendMessageRequest'] & {
  model?: string;
  reply_to?: ReplyToDto;
  attachments?: string[];
};

// Temporary extension until backend adds these fields to MessageResponse
export type MessageResponse = components['schemas']['MessageResponse'] & {
  reply_content: string | null;
  nested_chats: MessageNestedChat[];
  attachments: MessageAttachment[];
};

export type MessageListResponse = components['schemas']['MessageListResponse'];
