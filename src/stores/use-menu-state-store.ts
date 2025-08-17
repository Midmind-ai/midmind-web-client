import { create } from 'zustand';

type MenuStateStore = {
  activeMenuId: string | null;
  openMenu: (menuId: string) => void;
  closeMenu: (menuId?: string) => void;
  isMenuOpen: (menuId: string) => boolean;
};

/**
 * Global store to coordinate EntityActionsMenu state.
 * Ensures only one menu can be open at a time.
 */
export const useMenuStateStore = create<MenuStateStore>((set, get) => ({
  activeMenuId: null,

  openMenu: (menuId: string) => {
    set({ activeMenuId: menuId });
  },

  closeMenu: (menuId?: string) => {
    set(state => {
      // If specific menuId provided, only close if it's the active one
      if (menuId && state.activeMenuId !== menuId) {
        return state;
      }

      // Otherwise close any active menu
      return { activeMenuId: null };
    });
  },

  isMenuOpen: (menuId: string) => {
    const state = get();

    return state.activeMenuId === menuId;
  },
}));
