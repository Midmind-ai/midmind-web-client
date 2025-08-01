export const getSelectedText = () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  return selectedText && selection && selection.rangeCount > 0 ? selectedText : null;
};

export const isFullTextSelected = (content: string) => {
  const selectedText = getSelectedText();

  if (!selectedText) {
    return false;
  }

  const normalizedSelectedText = selectedText.replace(/\s+/g, ' ').trim();
  const normalizedContent = content.replace(/\s+/g, ' ').trim();

  return normalizedSelectedText === normalizedContent;
};

export const getTextPositions = (content: string) => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return { startPosition: 0, endPosition: 0 };
  }

  const selectedText = selection.toString().trim();

  if (!selectedText) {
    return { startPosition: 0, endPosition: 0 };
  }

  const startPosition = content.indexOf(selectedText);
  const endPosition = startPosition + selectedText.length;

  return { startPosition, endPosition };
};
