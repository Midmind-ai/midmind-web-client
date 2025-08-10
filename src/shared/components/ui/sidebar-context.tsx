import * as React from 'react';

// Width context for sharing between provider and resize handle
export const SidebarWidthContext = React.createContext<{
  width: number;
  setWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (isResizing: boolean) => void;
} | null>(null);

export function useSidebarWidthContext() {
  const context = React.useContext(SidebarWidthContext);
  if (!context) {
    throw new Error('useSidebarWidthContext must be used within a SidebarProvider.');
  }

  return context;
}
