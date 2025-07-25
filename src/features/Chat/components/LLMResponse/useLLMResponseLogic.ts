import { useCallback, useEffect, useState } from 'react';

import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@/features/Chat/utils/llmResponseEmitter';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import type { SendMessageToChatResponse } from '@/shared/services/chats/types';

export const useLLMResponseLogic = (content: string) => {
  const { value: currentModel } = useUrlParams(SearchParams.Model);
  const [streamingContent, setStreamingContent] = useState(content);

  const handleResponseChunk = useCallback((chunk: SendMessageToChatResponse) => {
    setStreamingContent(prev => prev + chunk.body);
  }, []);

  useEffect(() => {
    subscribeToResponseChunk(handleResponseChunk);

    return () => {
      unsubscribeFromResponseChunk(handleResponseChunk);
    };
  }, [handleResponseChunk]);

  return {
    streamingContent,
    currentModel,
  };
};
