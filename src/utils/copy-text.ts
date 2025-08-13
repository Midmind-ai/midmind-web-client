export const copyText = (content: string) => {
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (selectedText) {
      navigator.clipboard.writeText(selectedText);

      return;
    }
  }

  navigator.clipboard.writeText(content);
};
