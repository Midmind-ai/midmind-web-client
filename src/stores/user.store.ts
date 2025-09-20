import { create } from 'zustand';
import type { User } from '@services/users/users-dtos';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>(set => ({
  user: null,
  isAuthenticated: false,
  setUser: user => set({ user }),
  setAuthenticated: value => set({ isAuthenticated: value }),
  reset: () => set({ user: null, isAuthenticated: false }),
}));
