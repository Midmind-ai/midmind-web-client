import { useNavigate, useParams } from 'react-router';

import { useSplitChatLogic } from '@/features/Chat/components/SplitChat/useSplitChatLogic';
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

export const useMessageHandlers = () => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();
  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);
  const { isSplitMode, childChatId } = useSplitChatLogic();

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

    const parentChatId = isSplitMode && chatId === childChatId ? childChatId : chatId;

    const threadContext = {
      parent_chat_id: parentChatId,
      parent_message_id: messageId,
      connection_type: connectionType,
      context_type: contextType,
      ...(contextType === 'text_selection' && {
        selected_text: textToUse,
        start_position: startPosition,
        end_position: endPosition,
      }),
    };

    emitThreadCreated({ threadContext });

    const newChatId = await createChat({
      content: textToUse,
      model: currentModel,
    });

    navigate(`${AppRoutes.Chat(newChatId)}?${SearchParams.Model}=${currentModel}`);
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
