import { useRef, type UIEvent, useEffect } from 'react';

import { useNavigate, useParams } from 'react-router';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';
import { useGetChatMessages } from '@/features/Chat/hooks/useGetChatMessages';
import type { ConnectionType, ContextType, LLModel } from '@/features/Chat/types/chatTypes';
import { emitThreadCreated } from '@/features/Chat/utils/threadEventEmitter';
import { AppRoutes, SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import {
  getSelectedText,
  isFullTextSelected,
  getTextPositions,
} from '@/shared/utils/textSelection';

const LOAD_MORE_SCROLL_DISTANCE = 1000; // 1000px

export const useMessageListLogic = () => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();
  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);

  const { createChat } = useCreateChat();
  const {
    messages,
    isLoading: isMessagesLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useGetChatMessages(chatId);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousScrollTopPositionRef = useRef(0);

  const handleAutoScroll = (withAnimation = false) => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );

      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: withAnimation ? 'smooth' : 'auto',
        });
      }
    }
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    const isScrollingUp = scrollTop < previousScrollTopPositionRef.current;

    if (
      isScrollingUp &&
      scrollTop < LOAD_MORE_SCROLL_DISTANCE &&
      hasMore &&
      !isValidating &&
      !isMessagesLoading
    ) {
      loadMore();
    }

    previousScrollTopPositionRef.current = scrollTop;
  };

  const handleCopyText = () => {
    const selectedText = getSelectedText();
    navigator.clipboard.writeText(selectedText || '');
  };

  const createBranch = async (
    messageId: string,
    content: string,
    connectionType: ConnectionType
  ) => {
    const selectedText = getSelectedText();
    const isFullSelected = isFullTextSelected(content);
    const { startPosition, endPosition } = getTextPositions(content);

    const contextType: ContextType = isFullSelected ? 'full_message' : 'text_selection';
    const textToUse = selectedText || content;
    const threadContext = {
      parent_chat_id: chatId,
      parent_message_id: messageId,
      connection_type: connectionType,
      context_type: contextType,
      thread_level: 0, // will be removed in the future
      selected_text: textToUse,
      start_position: startPosition,
      end_position: endPosition,
    };

    const newChatId = await createChat({
      content: textToUse,
      model: currentModel,
      threadContext,
    });

    navigate(`${AppRoutes.Chat(newChatId)}?${SearchParams.Model}=${currentModel}`);

    emitThreadCreated({
      threadContext,
    });
  };

  const handleNewAttachedBranch = (messageId: string, content: string) => {
    createBranch(messageId, content, 'attached');
  };

  const handleNewDetachedBranch = (messageId: string, content: string) => {
    createBranch(messageId, content, 'detached');
  };

  const handleNewTemporaryBranch = (messageId: string, content: string) => {
    createBranch(messageId, content, 'temporary');
  };

  const handleReply = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const handleNewSetOfBranches = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const handleOpenBranch = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const handleOpenInSidePanel = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const handleOpenInNewTab = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const handleNewNote = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  useEffect(() => {
    handleAutoScroll();
  }, [chatId, isMessagesLoading]);

  return {
    messages,
    isMessagesLoading,
    scrollAreaRef,
    handleScroll,
    handleCopyText,
    handleReply,
    handleNewAttachedBranch,
    handleNewDetachedBranch,
    handleNewTemporaryBranch,
    handleNewSetOfBranches,
    handleOpenBranch,
    handleOpenInSidePanel,
    handleOpenInNewTab,
    handleNewNote,
  };
};
