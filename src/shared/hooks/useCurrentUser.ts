import { useUserStore } from '@shared/stores/useUserStore';

import type { User } from '@shared/types/entities';

export const useCurrentUser = (): User => {
  const { user, isAuthenticated } = useUserStore();

  if (!isAuthenticated || !user) {
    throw new Error('User is not authenticated');
  }

  return user;
};
