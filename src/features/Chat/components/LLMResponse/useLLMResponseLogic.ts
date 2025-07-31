import { useCallback, useEffect, useState } from 'react';

import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@/features/Chat/utils/llmResponseEmitter';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import type { ConversationWithAIResponse } from '@/shared/services/chats/types';

export const useLLMResponseLogic = (id: string, content: string) => {
  const { value: currentModel } = useUrlParams(SearchParams.Model);
  const [streamingContent, setStreamingContent] = useState(content);

  const handleResponseChunk = useCallback(
    (chunk: ConversationWithAIResponse) => {
      if (id === chunk.id && chunk.body) {
        setStreamingContent(prev => prev + chunk.body);
      }
    },
    [id]
  );

  useEffect(() => {
    subscribeToResponseChunk(handleResponseChunk);

    return () => {
      unsubscribeFromResponseChunk(handleResponseChunk);
    };
  }, [handleResponseChunk]);

  return {
    currentModel,
    streamingContent,
  };
};
