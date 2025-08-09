import type {
  HighlightTextNodeArgs,
  BranchContext,
} from '@features/chat/types/chat-types';

export const captureSelection = (messageElement: Element) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString().trim();

  if (!selectedText) {
    return;
  }

  const beforeSelection = range.cloneRange();
  beforeSelection.selectNodeContents(messageElement);
  beforeSelection.setEnd(range.startContainer, range.startOffset);
  const startPosition = beforeSelection.toString().length;

  const endPosition = startPosition + selectedText.length;

  return {
    endPosition,
    selectedText,
    startPosition,
  };
};

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

const highlightTextNode = ({
  textNode,
  branchContext,
  onSelectionClick,
}: HighlightTextNodeArgs): void => {
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
