import { useParams } from 'react-router';
import { DEFAULT_AI_MODEL } from '@constants/ai-models';
import { useChatsStore } from '@features/chat/stores/chats.store';
import type {
  CreateBranchArgs,
  UseMessageSelectionContextT,
} from '@features/chat-old/types/chat-types';
import { emitBranchCreated } from '@features/chat-old/utils/branch-creation-emitter';
import { emitMessageReply } from '@features/chat-old/utils/message-reply-emitter';
import { useFileSystemStore } from '@features/file-system/stores/file-system.store';
import { openChatInNewTab, openChatInSidePanel } from '@hooks/use-split-screen-actions';
import type { ConversationBranchContext } from '@shared-types/entities';

export const useChatActions = (actualChatId?: string) => {
  const { id: urlChatId = '' } = useParams();
  const chatId = actualChatId || urlChatId;

  const createChat = useFileSystemStore(state => state.createChat);

  const createBranch = async ({
    content,
    messageId,
    selectionContext,
    connectionType,
  }: CreateBranchArgs) => {
    const textToUse = selectionContext?.selectedText || content;

    // First create the chat
    const newChatId = await createChat({
      parentChatId: chatId,
      openInSplitScreen: true,
      branchContext: {
        parent_chat_id: chatId,
        parent_message_id: messageId,
        selected_text: selectionContext?.selectedText,
        start_position: selectionContext?.startPosition,
        end_position: selectionContext?.endPosition,
        connection_type: connectionType,
        context_type: selectionContext ? 'text_selection' : 'full_message',
      },
    });

    // Then send the initial message
    const { sendMessage } = useChatsStore.getState();
    await sendMessage(newChatId, textToUse, DEFAULT_AI_MODEL);

    const branchContext: ConversationBranchContext = {
      id: messageId,
      child_chat_id: newChatId,
      connection_type: connectionType,
      connection_color: '', // Default color
      context_type: selectionContext ? 'text_selection' : 'full_message',
      start_position: selectionContext?.startPosition || null,
      end_position: selectionContext?.endPosition || null,
    };

    emitBranchCreated({ branchContext });

    if (selectionContext) {
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
      selectionContext,
      connectionType: 'attached',
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
      selectionContext,
      connectionType: 'detached',
    });
  };

  const createTemporaryBranch = (messageId: string, content: string) => {
    createBranch({
      messageId,
      content,
      connectionType: 'temporary',
    });
  };

  const createNewBranchSet = (_messageId: string) => {
    // eslint-disable-next-line no-alert
    alert('Coming soon');
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
