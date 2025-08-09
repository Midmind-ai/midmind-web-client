import { useNavigate, useParams, useLocation } from 'react-router';

import { AppRoutes, SearchParams } from '@shared/constants/router';

import { useUrlParams } from '@shared/hooks/use-url-params';

import type { BranchContext } from '@shared/types/entities';

import { useCreateChat } from '@features/chat/hooks/use-create-chat';
import type {
  CreateBranchArgs,
  UseMessageSelectionContextT,
  ContextType,
  LLModel,
} from '@features/chat/types/chat-types';
import { emitBranchCreated } from '@features/chat/utils/branch-creation-emitter';

export const useMessageHandlers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: chatId = '' } = useParams();
  const { value: currentModel } = useUrlParams<LLModel>(SearchParams.Model);

  const { createChat } = useCreateChat();

  const openChatInSplitView = (chatId: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set(SearchParams.Split, chatId);

    navigate(`${location.pathname}${currentUrl.search}`);
  };

  const createBranch = async ({
    content,
    messageId,
    connectionType,
    selectionContext,
  }: CreateBranchArgs) => {
    const contextType: ContextType = selectionContext ? 'text_selection' : 'full_message';

    const textToUse = selectionContext?.selectedText || content;

    const parentChatId = chatId;

    const branchContext: BranchContext = {
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

    emitBranchCreated({ branchContext });

    const newChatId = await createChat({
      content: textToUse,
      model: currentModel,
    });

    openChatInSplitView(newChatId);
  };

  const handleNewAttachedBranch = (
    messageId: string,
    content: string,
    selectionContext?: UseMessageSelectionContextT
  ) => {
    createBranch({
      content,
      messageId,
      connectionType: 'attached',
      selectionContext,
    });
  };

  const handleNewDetachedBranch = (
    messageId: string,
    content: string,
    selectionContext?: UseMessageSelectionContextT
  ) => {
    createBranch({
      content,
      messageId,
      connectionType: 'detached',
      selectionContext,
    });
  };

  const handleNewTemporaryBranch = (messageId: string, content: string) => {
    createBranch({ messageId, content, connectionType: 'temporary' });
  };

  const handleReply = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const createNewSetOfBranches = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const openChat = (chatId: string) => {
    // eslint-disable-next-line no-alert
    alert(chatId);
  };

  const openChatInSidePanel = (chatId: string) => {
    openChatInSplitView(chatId);
  };

  const openChatInNewTab = (chatId: string) => {
    window.open(
      `${AppRoutes.Chat(chatId)}?${SearchParams.Model}=${currentModel}`,
      '_blank',
      'noopener,noreferrer'
    );
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
    createNewSetOfBranches,
    openChat,
    openChatInSidePanel,
    openChatInNewTab,
    handleNewNote,
  };
};
