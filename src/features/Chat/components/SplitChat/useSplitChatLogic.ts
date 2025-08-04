import { useState } from 'react';

import { useParams } from 'react-router';

import { useThreadContext } from '@/features/Chat/hooks/useThreadContext';

export const useSplitChatLogic = () => {
  const { id: currentChatId = '' } = useParams();
  const { threadContext, clearThreadContext } = useThreadContext(currentChatId);

  const [isParentFullscreen, setIsParentFullscreen] = useState(false);
  const [isChildFullscreen, setIsChildFullscreen] = useState(false);

  const parentChatId = threadContext?.parent_chat_id;
  const childChatId = currentChatId;

  const isSplitMode = Boolean(parentChatId && childChatId && parentChatId !== childChatId);

  const handleToggleParentFullscreen = () => {
    setIsParentFullscreen(prev => !prev);

    if (!isParentFullscreen) {
      setIsChildFullscreen(false);
    }
  };

  const handleToggleChildFullscreen = () => {
    setIsChildFullscreen(prev => !prev);

    if (!isChildFullscreen) {
      setIsParentFullscreen(false);
    }
  };

  return {
    threadContext,
    isSplitMode,
    parentChatId,
    childChatId,
    clearThreadContext,
    isParentFullscreen,
    isChildFullscreen,
    handleToggleParentFullscreen,
    handleToggleChildFullscreen,
  };
};
