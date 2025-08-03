import { useNavigate, useParams } from 'react-router';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';
import type { ConnectionType, ContextType, LLModel } from '@/features/Chat/types/chatTypes';
import { emitThreadCreated } from '@/features/Chat/utils/threadEventEmitter';
import { AppRoutes, SearchParams } from '@/shared/constants/router';
import { useUrlParams } from '@/shared/hooks/useUrlParams';
import {
  getSelectedText,
  isFullTextSelected,
  getTextPositions,
} from '@/shared/utils/textSelection';

export const useSplitChatHandlers = () => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();
  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);

  const { createChat } = useCreateChat();

  const createBranch = async (
    messageId: string,
    content: string,
    connectionType: ConnectionType
  ) => {
    const selectedText = getSelectedText();
    const isFullSelected = isFullTextSelected(content);
    const { startPosition, endPosition } = getTextPositions(content);

    const contextType: ContextType =
      !selectedText || isFullSelected ? 'full_message' : 'text_selection';
    const textToUse = selectedText || content;
    const threadContext = {
      parent_chat_id: chatId,
      parent_message_id: messageId,
      connection_type: connectionType,
      context_type: contextType,
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

  const handleCopyText = () => {
    const selectedText = getSelectedText();
    navigator.clipboard.writeText(selectedText || '');
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

  return {
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
