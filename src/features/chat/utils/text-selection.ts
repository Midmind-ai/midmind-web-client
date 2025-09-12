export type SelectionContext = {
  selectedText: string;
  startPosition: number;
  endPosition: number;
};

/**
 * Captures the current text selection within a specific element
 * Returns selection context with text and character positions
 */
export const captureSelection = (messageElement: Element): SelectionContext | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  // Don't capture empty selections
  if (!selectedText) {
    return null;
  }

  // Check if selection is within the message element
  if (!messageElement.contains(range.commonAncestorContainer)) {
    return null;
  }

  // Calculate start position relative to the message element
  const beforeSelectionRange = range.cloneRange();
  beforeSelectionRange.selectNodeContents(messageElement);
  beforeSelectionRange.setEnd(range.startContainer, range.startOffset);
  const startPosition = beforeSelectionRange.toString().length;

  // Calculate end position
  const endPosition = startPosition + selectedText.length;

  return {
    selectedText,
    startPosition,
    endPosition,
  };
};

/**
 * Checks if there's a text selection within the given element
 */
export const hasSelectionWithinElement = (element: Element): boolean => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const range = selection.getRangeAt(0);

  return (
    !range.collapsed &&
    element.contains(range.commonAncestorContainer) &&
    range.toString().trim().length > 0
  );
};

/**
 * Clears the current text selection
 */
export const clearSelection = (): void => {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
  }
};

/**
 * Gets the position of the current selection for popup placement
 */
export const getSelectionPosition = (): { x: number; y: number } | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Position popup at the center-top of selection
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + window.scrollY, // Include scroll offset
  };
};

/**
 * Creates a text range from start and end positions within an element
 * Used for highlighting existing branch selections
 */
export const createRangeFromPositions = (
  element: Element,
  startPos: number,
  endPos: number
): Range | null => {
  const textNodes: Node[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  let currentPos = 0;
  let startContainer: Node | null = null;
  let startOffset = 0;
  let endContainer: Node | null = null;
  let endOffset = 0;

  for (const textNode of textNodes) {
    const nodeLength = textNode.textContent?.length || 0;
    const nodeEndPos = currentPos + nodeLength;

    if (!startContainer && startPos >= currentPos && startPos <= nodeEndPos) {
      startContainer = textNode;
      startOffset = startPos - currentPos;
    }

    if (!endContainer && endPos >= currentPos && endPos <= nodeEndPos) {
      endContainer = textNode;
      endOffset = endPos - currentPos;
    }

    if (startContainer && endContainer) {
      break;
    }

    currentPos = nodeEndPos;
  }

  if (!startContainer || !endContainer) {
    return null;
  }

  const range = document.createRange();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);

  return range;
};

/**
 * Branch context for text highlighting
 */
export type BranchContext = {
  color: string;
  branchId: string;
  endPosition: number;
  startPosition: number;
  connectionType: string;
};

/**
 * Highlights a text selection with colored underline and click handlers
 */
export const highlightSelection = (
  messageElement: Element,
  selection: BranchContext,
  onSelectionClick: (branchId: string) => void
) => {
  // Get all text nodes that intersect with the selection
  const textNodesToHighlight = getIntersectingTextNodes(messageElement, selection);

  // Process text nodes in reverse order to maintain correct DOM positions
  for (let i = textNodesToHighlight.length - 1; i >= 0; i--) {
    const { textNode, highlightStart, highlightEnd } = textNodesToHighlight[i];
    highlightTextNode({
      textNode,
      branchContext: {
        endPosition: highlightEnd,
        startPosition: highlightStart,
        color: selection.color,
        branchId: selection.branchId,
        connectionType: selection.connectionType,
      },
      onSelectionClick,
    });
  }
};

/**
 * Clears all existing highlights from a message element
 */
export const clearHighlights = (messageElement: Element): void => {
  const highlights = messageElement.querySelectorAll('.text-selection-highlight');

  highlights.forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent && highlight.textContent) {
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    }
  });

  normalizeTextNodes(messageElement);
};

/**
 * Normalizes text nodes after removing highlights
 */
const normalizeTextNodes = (element: Element): void => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);

  const elements: Element[] = [element];
  let node;

  while ((node = walker.nextNode())) {
    elements.push(node as Element);
  }

  elements.forEach(el => {
    if (el.normalize) {
      el.normalize();
    }
  });
};

/**
 * Gets all text nodes that intersect with a selection
 */
const getIntersectingTextNodes = (
  messageElement: Element,
  selection: BranchContext
): Array<{ textNode: Text; highlightStart: number; highlightEnd: number }> => {
  const walker = document.createTreeWalker(messageElement, NodeFilter.SHOW_TEXT, null);

  const result: Array<{
    textNode: Text;
    highlightStart: number;
    highlightEnd: number;
  }> = [];
  let currentIndex = 0;
  let node;

  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const nodeLength = textNode.textContent?.length || 0;
    const nodeStart = currentIndex;
    const nodeEnd = currentIndex + nodeLength;

    // Check if this text node intersects with our selection
    if (nodeStart < selection.endPosition && nodeEnd > selection.startPosition) {
      const highlightStart = Math.max(0, selection.startPosition - nodeStart);
      const highlightEnd = Math.min(nodeLength, selection.endPosition - nodeStart);

      if (highlightStart < highlightEnd) {
        result.push({
          textNode,
          highlightStart,
          highlightEnd,
        });
      }
    }

    currentIndex += nodeLength;
  }

  return result;
};

/**
 * Highlights a specific text node with a colored underline span
 */
const highlightTextNode = ({
  textNode,
  branchContext,
  onSelectionClick,
}: {
  textNode: Text;
  branchContext: BranchContext;
  onSelectionClick: (branchId: string) => void;
}): void => {
  const parent = textNode.parentNode;

  if (!parent) {
    return;
  }

  const beforeText =
    textNode.textContent?.substring(0, branchContext.startPosition) || '';
  const selectedText =
    textNode.textContent?.substring(
      branchContext.startPosition,
      branchContext.endPosition
    ) || '';
  const afterText = textNode.textContent?.substring(branchContext.endPosition) || '';

  const fragments: Node[] = [];

  if (beforeText) {
    fragments.push(document.createTextNode(beforeText));
  }

  const highlightSpan = document.createElement('span');
  highlightSpan.style.cursor = 'pointer';
  highlightSpan.textContent = selectedText;
  highlightSpan.className = 'text-selection-highlight';
  highlightSpan.dataset.branchId = branchContext.branchId;
  highlightSpan.style.borderBottom = `2px ${branchContext.connectionType === 'attached' ? 'solid' : 'dotted'} ${branchContext.color}`;

  const setHighlightHover = (hover: boolean) => {
    const highlights = document.querySelectorAll(
      `.text-selection-highlight[data-branch-id="${branchContext.branchId}"]`
    );
    highlights.forEach(el => {
      (el as HTMLElement).style.backgroundColor = hover ? `${branchContext.color}22` : '';
    });
  };

  highlightSpan.addEventListener('mouseenter', () => setHighlightHover(true));
  highlightSpan.addEventListener('mouseleave', () => setHighlightHover(false));

  highlightSpan.addEventListener('click', e => {
    e.stopPropagation();
    onSelectionClick(branchContext.branchId);
  });

  fragments.push(highlightSpan);

  if (afterText) {
    fragments.push(document.createTextNode(afterText));
  }

  fragments.forEach(fragment => {
    parent.insertBefore(fragment, textNode);
  });
  parent.removeChild(textNode);
};
