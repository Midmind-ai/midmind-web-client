import { create } from 'zustand';
import type { SelectionContext } from '../utils/text-selection';

type SelectionState = {
  // Current selection data
  selection: SelectionContext | null;
  messageId: string | null;
  chatId: string | null;

  // Popup state
  isPopupVisible: boolean;
  isMenuExpanded: boolean;
  popupPosition: { x: number; y: number } | null;

  // Actions
  setSelection: (
    selection: SelectionContext | null,
    messageId: string | null,
    chatId: string | null,
    position?: { x: number; y: number } | null
  ) => void;
  clearSelection: () => void;
  showPopup: (position: { x: number; y: number }) => void;
  hidePopup: () => void;
  expandMenu: () => void;
  collapseMenu: () => void;
};

export const useSelectionStore = create<SelectionState>(set => ({
  // Initial state
  selection: null,
  messageId: null,
  chatId: null,
  isPopupVisible: false,
  isMenuExpanded: false,
  popupPosition: null,

  // Actions
  setSelection: (selection, messageId, chatId, position = null) =>
    set({
      selection,
      messageId,
      chatId,
      popupPosition: position,
      isPopupVisible: selection !== null,
      isMenuExpanded: false,
    }),

  clearSelection: () =>
    set({
      selection: null,
      messageId: null,
      chatId: null,
      isPopupVisible: false,
      isMenuExpanded: false,
      popupPosition: null,
    }),

  showPopup: position =>
    set({
      isPopupVisible: true,
      popupPosition: position,
    }),

  hidePopup: () =>
    set({
      isPopupVisible: false,
      isMenuExpanded: false,
    }),

  expandMenu: () =>
    set({
      isMenuExpanded: true,
    }),

  collapseMenu: () =>
    set({
      isMenuExpanded: false,
    }),
}));
