import { memo } from 'react';
import BranchBadge from './branch-badge';
import type { ChatMessage } from '@shared-types/entities';

type Props = {
  chatId: string;
  branches: ChatMessage['nested_chats'];
};

const Branches = ({ chatId, branches }: Props) => {
  if (!branches || branches.length === 0) {
    return null;
  }

  const filteredBranches = branches.filter(
    branch => branch.connection_type !== 'temporary'
  );

  if (filteredBranches.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-2.5">
      {filteredBranches.map(
        ({ id, connection_color, connection_type, child_chat_id }) => (
          <BranchBadge
            key={id}
            bgColor={connection_color}
            chatId={chatId}
            branchChatId={child_chat_id}
            connectionType={connection_type}
          />
        )
      )}
    </div>
  );
};

export default memo(Branches);
