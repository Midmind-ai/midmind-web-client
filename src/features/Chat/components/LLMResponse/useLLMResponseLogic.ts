import { useCallback, useEffect, useState } from 'react';

import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@/features/Chat/utils/llmResponseEmitter';
import { SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import type { SendMessageToChatResponse } from '@/shared/services/chats/types';

export const useLLMResponseLogic = (id: string, content: string, onContentChange: VoidFunction) => {
  const { value: currentModel } = useUrlParams(SearchParams.Model);
  const [streamingContent, setStreamingContent] = useState(content);

  const handleResponseChunk = useCallback(
    (chunk: SendMessageToChatResponse) => {
      if (id === chunk.id && chunk.body) {
        setStreamingContent(prev => {
          if (prev.endsWith(chunk.body)) {
            return prev;
          }

          return prev + chunk.body;
        });

        onContentChange();
      }
    },
    [id, onContentChange]
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
