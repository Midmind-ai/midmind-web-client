import { memo } from 'react';
import ImageWithFallback from './components/image-with-fallback';
import MessageReply from './components/message-reply';
import { ThemedP } from '@components/ui/themed-p';
import { useModalOperations } from '@hooks/logic/use-modal-operations';
import type { ChatMessage } from '@shared-types/entities';

type Props = {
  message: ChatMessage;
  getFileUrl: (attachmentId: string) => string;
};

const UserMessage = ({ message, getFileUrl }: Props) => {
  const { content, reply_content, attachments } = message;
  const { openModal } = useModalOperations();

  return (
    <div>
      {attachments.length > 0 && (
        <div className="mx-5 ml-auto flex w-fit max-w-full flex-wrap justify-end gap-2">
          {attachments.map(attachment => (
            <ImageWithFallback
              key={attachment.id}
              role="button"
              onClick={() =>
                openModal('FileViewModal', { fileUrl: getFileUrl(attachment.id) })
              }
              src={getFileUrl(attachment.id)}
              alt={attachment.original_filename}
              className="h-auto max-h-80 w-auto max-w-3xl rounded-lg object-cover
                shadow-sm"
            />
          ))}
        </div>
      )}
      {content && (
        <div className="group w-full rounded-md bg-transparent px-5 py-2.5">
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
      )}
    </div>
  );
};

export default memo(UserMessage);
