import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import { useTextHighlight } from '@features/chat/hooks/use-text-highlight';
import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@features/chat/utils/llm-response-emitter';
import { captureSelection } from '@features/chat/utils/text-selection';

import type { ConversationWithAIResponseDto } from '@services/conversations/conversations-dtos';

import type { ChatMessage } from '@shared-types/entities';

type UseLLMResponseLogicArgs = {
  id: string;
  content: string;
  branches: ChatMessage['branches'];
  onOpenInSidePanel: (branchChatId: string) => void;
};

export const useLLMResponseLogic = ({
  id,
  content,
  branches,
  onOpenInSidePanel,
}: UseLLMResponseLogicArgs) => {
  const { id: chatId } = useParams();

  const { messageRef } = useTextHighlight({
    branches,
    onOpenInSidePanel,
  });

  const [isWaiting, setIsWaiting] = useState(false);
  const [streamingContent, setStreamingContent] = useState(content);

  const getCurrentSelectionContext = () => {
    if (messageRef.current) {
      return captureSelection(messageRef.current);
    }
  };

  useEffect(() => {
    const handleResponseChunk = (chunk: ConversationWithAIResponseDto) => {
      if (id === chunk.id) {
        setIsWaiting(false);

        if (chunk.body && chunk.type === 'content') {
          setStreamingContent(prev => prev + chunk.body);
        }
      }
    };

    if (content === '' && !streamingContent) {
      setIsWaiting(true);
    }

    subscribeToResponseChunk(handleResponseChunk);

    return () => {
      unsubscribeFromResponseChunk(handleResponseChunk);
    };
  }, [id, chatId, content, streamingContent]);

  return {
    messageRef,
    streamingContent,
    isWaiting,
    getCurrentSelectionContext,
  };
};
