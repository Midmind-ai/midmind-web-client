import { copyText } from '@shared/utils/copy-text';

import { emitMessageReply } from '@features/chat/utils/message-reply-emitter';

export const useMessageActions = (chatId: string) => {
  const replyToMessage = (messageId: string, content: string) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    emitMessageReply({
      replyTo: {
        id: messageId,
        content: selectedText || content,
      },
      targetChatId: chatId,
    });
  };

  return {
    copyText,
    replyToMessage,
  };
};
