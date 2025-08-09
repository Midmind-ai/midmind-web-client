import { useState } from 'react';

import { useParams } from 'react-router';

import { usePageTitle } from '@shared/hooks/use-page-title';

import { useBranchContext } from '@features/chat/hooks/use-branch-context';

export const useSplitChatLogic = () => {
  const { id: currentChatId = '' } = useParams();
  const { branchContext, clearBranchContext } = useBranchContext(currentChatId);

  const [isParentFullscreen, setIsParentFullscreen] = useState(false);
  const [isChildFullscreen, setIsChildFullscreen] = useState(false);

  const parentChatId = branchContext?.parent_chat_id;
  const childChatId = currentChatId;

  const isSplitMode = Boolean(
    parentChatId && childChatId && parentChatId !== childChatId
  );

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

  usePageTitle('New chat');

  return {
    branchContext,
    isSplitMode,
    parentChatId,
    childChatId,
    clearBranchContext,
    isParentFullscreen,
    isChildFullscreen,
    handleToggleParentFullscreen,
    handleToggleChildFullscreen,
  };
};
