import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import type { LLModel } from '@/features/Chat/types/chatTypes';
import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@/features/Chat/utils/llmResponseEmitter';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import type { ConversationWithAIResponseDto } from '@/shared/services/conversations/conversations.dto';

export const useLLMResponseLogic = (id: string, content: string, isLastMessage: boolean) => {
  const isNewMessage = isLastMessage && content.length < 10;

  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);
  const { id: chatId } = useParams();

  const [isStreaming, setIsStreaming] = useState(isNewMessage);
  const [streamingContent, setStreamingContent] = useState(content);

  useEffect(() => {
    const handleResponseChunk = (chunk: ConversationWithAIResponseDto) => {
      if (id === chunk.id && chunk.body && chunk.type === 'content') {
        setIsStreaming(true);
        setStreamingContent(prev => prev + chunk.body);
      }

      if (id === chunk.id && chunk.type === 'complete') {
        setIsStreaming(false);
      }
    };

    subscribeToResponseChunk(handleResponseChunk);

    return () => {
      unsubscribeFromResponseChunk(handleResponseChunk);
    };
  }, [id, chatId]);

  return {
    currentModel,
    streamingContent,
    isStreaming,
  };
};
