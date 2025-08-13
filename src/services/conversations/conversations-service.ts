import { baseAxiosInstance } from '@config/axios';

import type {
  ConversationWithAIRequestDto,
  ConversationWithAIResponseDto,
} from '@services/conversations/conversations-dtos';

import type { AxiosProgressEvent } from 'axios';

export class ConversationsService {
  static async conversationWithAI(
    body: ConversationWithAIRequestDto,
    onChunk: (data: ConversationWithAIResponseDto) => void,
    signal?: AbortSignal
  ) {
    let lastProcessedLength = 0;

    await baseAxiosInstance.post<ConversationWithAIResponseDto>(`/conversations`, body, {
      responseType: 'text',
      signal,
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        const responseText = progressEvent.event.target.response;

        const newData = responseText.slice(lastProcessedLength);
        lastProcessedLength = responseText.length;

        const lines = newData.split('\n').filter((line: string) => line.trim());

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');

            const parsed = JSON.parse(jsonStr);

            onChunk(parsed);
          }
        }
      },
    });
  }
}
