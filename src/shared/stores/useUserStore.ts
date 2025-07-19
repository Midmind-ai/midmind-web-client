import { create } from 'zustand';

import type { User } from '@shared/types/entities';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

export const useUserStore = create<UserState>(set => ({
  user: null,
  isAuthenticated: false,
  setUser: user => set({ user }),
  setAuthenticated: value => set({ isAuthenticated: value }),
}));
