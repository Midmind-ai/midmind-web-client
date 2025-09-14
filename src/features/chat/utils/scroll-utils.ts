// Utility to scroll to the bottom of the chat messages
export const scrollToBottom = () => {
  setTimeout(() => {
    // Find the last message in the current chat
    const lastMessage = document.querySelector('[data-last-message="true"]');

    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, 0);
};
