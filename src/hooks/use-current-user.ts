import { useUserStore } from '@/stores/use-user-store';
import type { User } from '@/types/entities';

export const useCurrentUser = (): User => {
  const { user, isAuthenticated } = useUserStore();

  if (!isAuthenticated || !user) {
    throw new Error('User is not authenticated');
  }

  return user;
};
