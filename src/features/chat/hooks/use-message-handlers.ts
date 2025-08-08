import { useNavigate, useParams } from 'react-router';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import { useSplitChatLogic } from '@features/chat/components/split-chat/use-split-chat-logic';
import { useCreateChat } from '@features/chat/hooks/use-create-chat';
import type {
  CreateBranchArgs,
  UseMessageSelectionContextT,
  ContextType,
  LLModel,
} from '@features/chat/types/chat-types';
import { emitThreadCreated } from '@features/chat/utils/thread-creation-emitter';

export const useMessageHandlers = () => {
  const navigate = useNavigate();
  const { id: chatId = '' } = useParams();
  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);
  const { isSplitMode, childChatId } = useSplitChatLogic();

  const { createChat } = useCreateChat();

  const createBranch = async ({
    content,
    messageId,
    connectionType,
    selectionContext,
  }: CreateBranchArgs) => {
    const contextType: ContextType = selectionContext ? 'text_selection' : 'full_message';

    const textToUse = selectionContext?.selectedText || content;

    const parentChatId = isSplitMode && chatId === childChatId ? childChatId : chatId;

    const threadContext = {
      parent_chat_id: parentChatId,
      parent_message_id: messageId,
      connection_type: connectionType,
      context_type: contextType,
      ...(contextType === 'text_selection' && {
        selected_text: textToUse,
        start_position: selectionContext?.startPosition,
        end_position: selectionContext?.endPosition,
      }),
    };

    emitThreadCreated({ threadContext });

    const newChatId = await createChat({
      content: textToUse,
      model: currentModel,
    });

    navigate(`${AppRoutes.Chat(newChatId)}?${SearchParams.Model}=${currentModel}`);
  };

  const handleNewAttachedBranch = (
    messageId: string,
    content: string,
    selectionContext?: UseMessageSelectionContextT
  ) => {
    createBranch({ content, messageId, connectionType: 'attached', selectionContext });
  };

  const handleNewDetachedBranch = (
    messageId: string,
    content: string,
    selectionContext?: UseMessageSelectionContextT
  ) => {
    createBranch({ content, messageId, connectionType: 'detached', selectionContext });
  };

  const handleNewTemporaryBranch = (messageId: string, content: string) => {
    createBranch({ messageId, content, connectionType: 'temporary' });
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
