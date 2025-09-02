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
  isLastMessage: boolean;
  branches: ChatMessage['nested_chats'];
  onOpenInSidePanel: (branchChatId: string) => void;
};

export const useLLMResponseLogic = ({
  id,
  content,
  branches,
  isLastMessage,
  onOpenInSidePanel,
}: UseLLMResponseLogicArgs) => {
  const { id: chatId } = useParams();

  const { messageRef } = useTextHighlight({
    nested_chats: branches,
    onOpenInSidePanel,
  });

  const [streamingContent, setStreamingContent] = useState(content);
  const [isStreamingStarted, setIsStreamingStarted] = useState(false);

  const isContentEmpty = content === '';
  const isStreaming = isStreamingStarted && streamingContent !== content;
  const isWaiting = isContentEmpty && !streamingContent;
  const shouldApplyMinHeight = isLastMessage && isStreamingStarted;

  const getCurrentSelectionContext = () => {
    if (messageRef.current) {
      return captureSelection(messageRef.current);
    }
  };

  useEffect(() => {
    const handleResponseChunk = (chunk: ConversationWithAIResponseDto) => {
      if (id === chunk.id) {
        if (chunk.body && chunk.type === 'content') {
          setStreamingContent(prev => prev + chunk.body);
        }
      }
    };

    if (isContentEmpty && !streamingContent && !isStreamingStarted) {
      setIsStreamingStarted(true);
    }

    subscribeToResponseChunk(handleResponseChunk);

    return () => {
      unsubscribeFromResponseChunk(handleResponseChunk);
    };
  }, [id, chatId, content, streamingContent, isStreamingStarted, isContentEmpty]);

  return {
    isWaiting,
    messageRef,
    isStreaming,
    streamingContent,
    shouldApplyMinHeight,
    getCurrentSelectionContext,
  };
};
