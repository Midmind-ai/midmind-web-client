import { v4 as uuidv4 } from 'uuid';
import { SearchParams } from '../constants/paths';
import { navigate } from '../hooks/use-navigation';
import { useEntityCreationStateStore } from '../stores/entity-creation-state.store';
import type { AIModel, ChatBranchContext, ChatMessage } from '../types/entities';
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
  const { appendNewNestedChat, setReplyContext } = useChatsStore.getState();
  const { createChat } = useFileSystemStore.getState();
  const { connectionType, parentChatId, parentMessageId, selectedText } = args;
  const newChatId = uuidv4();

  const [newBranchContext, rollbackNestedChat] = appendNewNestedChat({
    newChatId,
    connectionType,
    parentChatId,
    parentMessageId,
    contextType: args.contextType,
    selectedText: args.selectedText,
    startPosition: args.startPosition,
    endPosition: args.endPosition,
  });

  const branchContext = {
    ...newBranchContext,
    parent_message_id: parentMessageId,
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

    // Set reply context for the new chat if text was selected
    if (selectedText && args.contextType === 'text_selection') {
      setReplyContext(newChatId, {
        id: parentMessageId,
        content: selectedText,
      });
    }
  } catch (e) {
    rollbackNestedChat();
    throw e;
  }
};

export const createChatSendMessageAndNavigate = async (args: {
  parentChatId?: string;
  content: string;
  model: AIModel;
  attachments?: ChatMessage['attachments'];
}) => {
  const { sendMessage } = useChatsStore.getState();
  const { createChat } = useFileSystemStore.getState();
  const { startCreating, finishCreating } = useEntityCreationStateStore.getState();
  const { content, model, attachments = [] } = args;
  const newChatId = uuidv4();

  try {
    startCreating(newChatId);

    await createChat({
      newChatId,
      openInSplitScreen: true,
      navigate: _ => {
        // Navigate to new chat url
        navigate(`/chat/${newChatId}`);
      },
    });

    await sendMessage(newChatId, content, model, attachments);
  } finally {
    finishCreating(newChatId);
  }
};
