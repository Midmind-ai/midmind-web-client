export type UpdateChatDetailsRequest = {
  name: string;
};

export type SendMessageToChatRequest = {
  content: string;
  model: string;
  parent_message_id?: string;
};

export type SendMessageToChatResponse = {
  id: string;
  body: string;
  type: 'content' | 'error' | 'completed';
};
