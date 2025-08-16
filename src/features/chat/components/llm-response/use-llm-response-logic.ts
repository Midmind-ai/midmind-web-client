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

interface UseLLMResponseLogicArgs {
  id: string;
  content: string;
  isLastMessage: boolean;
  branches: ChatMessage['branches'];
  onStreamingStart: VoidFunction;
  onStreamingEnd: VoidFunction;
  onOpenInSidePanel: (branchChatId: string) => void;
}

export const useLLMResponseLogic = ({
  id,
  content,
  isLastMessage,
  branches,
  onOpenInSidePanel,
  onStreamingStart,
  onStreamingEnd,
}: UseLLMResponseLogicArgs) => {
  const isNewMessage = isLastMessage && content.length < 10;

  const { id: chatId } = useParams();

  const { messageRef } = useTextHighlight({
    branches,
    onOpenInSidePanel,
  });

  const [isStreaming, setIsStreaming] = useState(isNewMessage);
  const [streamingContent, setStreamingContent] = useState(content);

  const getCurrentSelectionContext = () => {
    if (messageRef.current) {
      return captureSelection(messageRef.current);
    }
  };

  useEffect(() => {
    const handleResponseChunk = (chunk: ConversationWithAIResponseDto) => {
      if (id === chunk.id && chunk.body && chunk.type === 'content') {
        setIsStreaming(true);
        setStreamingContent(prev => prev + chunk.body);
        onStreamingStart();
      }

      if (id === chunk.id && chunk.type === 'complete') {
        setIsStreaming(false);
        onStreamingEnd();
      }
    };

    subscribeToResponseChunk(handleResponseChunk);

    return () => {
      unsubscribeFromResponseChunk(handleResponseChunk);
    };
  }, [id, chatId, onStreamingStart, onStreamingEnd]);

  return {
    messageRef,
    streamingContent,
    isStreaming,
    getCurrentSelectionContext,
  };
};
