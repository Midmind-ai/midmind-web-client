import { ThemedP } from '@components/ui/themed-p';

import MessageReply from '../form/message-reply';

import type { ChatMessage } from '../../types';

type Props = {
  message: ChatMessage;
};

const UserMessage = ({ message }: Props) => {
  const { content, reply_content } = message;

  return (
    <div className="group w-full rounded-md bg-transparent p-2.5">
      <div className="ml-auto w-fit max-w-[465px]">
        {reply_content && (
          <MessageReply
            content={reply_content}
            className="mx-4 shadow-md"
            placement="message"
          />
        )}
        <div className="bg-accent rounded-[10px] p-2.5 shadow-sm select-text">
          <ThemedP className="text-base font-light">{content}</ThemedP>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;
