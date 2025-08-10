import { useCallback, useMemo, useState } from 'react';

import { debounce } from '@shared/utils/debounce';

// Constants for sidebar width constraints
export const DEFAULT_SIDEBAR_WIDTH = 352; // 22rem in pixels
export const MIN_SIDEBAR_WIDTH = 240; // ~15rem
export const MAX_SIDEBAR_WIDTH = 600; // ~37.5rem

// Utility function to clamp width within bounds
export const clampWidth = (width: number): number => {
  return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));
};

const STORAGE_KEY = 'sidebar-width';

export const useSidebarWidth = () => {
  const [width, setWidth] = useState(() => {
    // Initialize from localStorage or default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsedWidth = parseInt(stored, 10);

        return isNaN(parsedWidth) ? DEFAULT_SIDEBAR_WIDTH : clampWidth(parsedWidth);
      }
    }

    return DEFAULT_SIDEBAR_WIDTH;
  });

  // Debounced localStorage save
  const debouncedSave = useMemo(
    () =>
      debounce((newWidth: number) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, newWidth.toString());
        }
      }, 500),
    []
  );

  const updateWidth = useCallback(
    (newWidth: number) => {
      const clampedWidth = clampWidth(newWidth);
      setWidth(clampedWidth);
      debouncedSave(clampedWidth);
    },
    [debouncedSave]
  );

  const resetWidth = useCallback(() => {
    setWidth(DEFAULT_SIDEBAR_WIDTH);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, DEFAULT_SIDEBAR_WIDTH.toString());
    }
  }, []);

  return {
    width,
    setWidth: updateWidth,
    resetWidth,
  };
};
