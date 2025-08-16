import { useNavigate, useParams, useLocation } from 'react-router';

import { AppRoutes, SearchParams } from '@constants/paths';

import { DEFAULT_AI_MODEL } from '@features/chat/constants/ai-models';
import type {
  CreateBranchArgs,
  UseMessageSelectionContextT,
  ContextType,
} from '@features/chat/types/chat-types';
import { emitBranchCreated } from '@features/chat/utils/branch-creation-emitter';
import { emitMessageReply } from '@features/chat/utils/message-reply-emitter';
import { useCreateChat } from '@features/file-system/hooks/use-create-chat';

import type { BranchContext } from '@shared-types/entities';

export const useChatActions = (actualChatId?: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlChatId = '' } = useParams();

  const { createChat } = useCreateChat();

  const chatId = actualChatId || urlChatId;

  const openChatInSplitView = (newChatId: string) => {
    const currentUrl = new URL(window.location.href);
    const currentSplitChatId = currentUrl.searchParams.get(SearchParams.Split);

    if (actualChatId && currentSplitChatId && currentSplitChatId === actualChatId) {
      currentUrl.searchParams.set(SearchParams.Split, newChatId);

      navigate(`${AppRoutes.Chat(actualChatId)}${currentUrl.search}`);
    } else {
      currentUrl.searchParams.set(SearchParams.Split, newChatId);

      navigate(`${location.pathname}${currentUrl.search}`);
    }
  };

  const createBranch = async ({
    content,
    messageId,
    connectionType,
    selectionContext,
  }: CreateBranchArgs) => {
    const contextType: ContextType = selectionContext ? 'text_selection' : 'full_message';
    const isTextSelection = contextType === 'text_selection';

    const textToUse = selectionContext?.selectedText || content;

    const parentChatId = chatId;

    const branchContext: BranchContext = {
      parent_chat_id: parentChatId,
      parent_message_id: messageId,
      connection_type: connectionType,
      context_type: contextType,
      ...(isTextSelection && {
        selected_text: textToUse,
        start_position: selectionContext?.startPosition,
        end_position: selectionContext?.endPosition,
      }),
    };

    const newChatId = await createChat({
      content: textToUse,
      model: DEFAULT_AI_MODEL,
      parentChatId: parentChatId,
    });

    emitBranchCreated({ branchContext });

    openChatInSplitView(newChatId);

    if (isTextSelection) {
      // setTimeout is used to ensure the component has time to render and subscribe
      setTimeout(() => {
        emitMessageReply({
          replyTo: {
            id: messageId,
            content: textToUse,
          },
          targetChatId: newChatId,
        });
      }, 500);
    }
  };

  const createAttachedBranch = (
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

  const createDetachedBranch = (
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

  const createTemporaryBranch = (messageId: string, content: string) => {
    createBranch({ messageId, content, connectionType: 'temporary' });
  };

  const createNewBranchSet = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
  };

  const openChatInSidePanel = (chatId: string) => {
    openChatInSplitView(chatId);
  };

  const openChatInNewTab = (chatId: string) => {
    window.open(AppRoutes.Chat(chatId), '_blank', 'noopener,noreferrer');
  };

  return {
    createAttachedBranch,
    createDetachedBranch,
    createTemporaryBranch,
    createNewBranchSet,
    openChatInSidePanel,
    openChatInNewTab,
  };
};
