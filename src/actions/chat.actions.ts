import { v4 as uuidv4 } from 'uuid';
import { SearchParams } from '../constants/paths';
import { navigate } from '../hooks/use-navigation';
import type { AIModel, ChatBranchContext } from '../types/entities';
import { useChatsStore } from '@features/chat/stores/chats.store';
import { useFileSystemStore } from '@features/file-system/stores/file-system.store';

export const createNestedChatAndOpenSplitScreen = async (args: {
  parentChatId: string;
  parentMessageId: string;
  // model: AIModel;
  connectionType: 'attached' | 'detached' | 'temporary';
  contextType: 'full_message' | 'text_selection';
  startPosition?: number;
  endPosition?: number;
  selectedText?: string;
}) => {
  const { appendNewNestedChat } = useChatsStore.getState();
  const { createChat } = useFileSystemStore.getState();
  const {
    connectionType,
    contextType,
    parentChatId,
    parentMessageId,
    startPosition,
    endPosition,
    selectedText,
  } = args;
  const newChatId = uuidv4();

  const rollbackNestedChat = appendNewNestedChat({
    newChatId,
    connectionType,
    parentChatId,
    parentMessageId,
  });

  const branchContext = {
    connection_type: connectionType,
    context_type: contextType,
    parent_chat_id: parentChatId,
    parent_message_id: parentMessageId,
    start_position: startPosition,
    end_position: endPosition,
    selected_text: selectedText,
  } as ChatBranchContext;

  try {
    await createChat({
      newChatId,
      openInSplitScreen: true,
      parentChatId,
      branchContext,
      navigate: _ => {
        // Navigate to split screen view
        // Parent chat stays in URL path, nested chat goes to query param
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set(SearchParams.Split, newChatId);
        navigate(`/chat/${parentChatId}${currentUrl.search}`);
      },
    });
  } catch (e) {
    rollbackNestedChat();
    throw e;
  }
};

export const createChatSendMessageAndNavigate = async (args: {
  parentChatId?: string;
  content: string;
  model: AIModel;
}) => {
  const { sendMessage } = useChatsStore.getState();
  const { createChat } = useFileSystemStore.getState();
  const { content, model } = args;
  const newChatId = uuidv4();

  await createChat({
    newChatId,
    openInSplitScreen: true,
    navigate: _ => {
      // Navigate to new chat url
      navigate(`/chat/${newChatId}`);
    },
  });

  await sendMessage(newChatId, content, model);
};
