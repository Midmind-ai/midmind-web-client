export const copyText = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  navigator.clipboard.writeText(selectedText || '');
};
