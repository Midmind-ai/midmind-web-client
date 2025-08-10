import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import type { ConversationWithAIResponseDto } from '@shared/services/conversations/conversations-dtos';

import { useTextHighlight } from '@features/chat/hooks/use-text-highlight';
import {
  subscribeToResponseChunk,
  unsubscribeFromResponseChunk,
} from '@features/chat/utils/llm-response-emitter';

import type { ChatMessage } from '@/shared/types/entities';

export const useLLMResponseLogic = (
  id: string,
  content: string,
  isLastMessage: boolean,
  branches: ChatMessage['branches'],
  onOpenInSidePanel: (branchChatId: string) => void
) => {
  const isNewMessage = isLastMessage && content.length < 10;

  const { id: chatId } = useParams();

  const { messageRef } = useTextHighlight({
    branches,
    onOpenInSidePanel,
  });

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
    messageRef,
    streamingContent,
    isStreaming,
  };
};
