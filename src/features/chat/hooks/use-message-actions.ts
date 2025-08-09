import { copyText } from '@shared/utils/copy-text';

export const useMessageActions = () => {
  const replyToMessage = (messageId: string) => {
    // eslint-disable-next-line no-alert
    alert(`Coming soon for message ${messageId}`);
  };

  return {
    copyText,
    replyToMessage,
  };
};
