import { useEffect, useState } from 'react';

import type { LLModel } from '@/features/Chat/types/chatTypes';
import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@/features/Chat/utils/llmResponseEmitter';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import type { ConversationWithAIResponse } from '@/shared/services/chats/types';

export const useLLMResponseLogic = (id: string, content: string, isLastMessage: boolean) => {
  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);
  const [streamingContent, setStreamingContent] = useState(content);

  const isNewMessage = isLastMessage && content.length < 10;
  const [isStreaming, setIsStreaming] = useState(isNewMessage);

  useEffect(() => {
    const handleResponseChunk = (chunk: ConversationWithAIResponse) => {
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
  }, [id]);

  return {
    currentModel,
    streamingContent,
    isStreaming,
  };
};
