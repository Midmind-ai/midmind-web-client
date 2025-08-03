import { useParams } from 'react-router';

import { useThreadContext } from '@/features/Chat/hooks/useThreadContext';

export const useSplitChatLogic = () => {
  const { id: currentChatId } = useParams();
  const { threadContext } = useThreadContext(currentChatId || '');

  const parentChatId = threadContext?.parent_chat_id;
  const childChatId = currentChatId;

  const isSplitMode = Boolean(parentChatId && childChatId && parentChatId !== childChatId);

  return {
    isSplitMode,
    parentChatId,
    childChatId,
  };
};
