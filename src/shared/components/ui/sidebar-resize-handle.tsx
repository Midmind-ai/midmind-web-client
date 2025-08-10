import { useCallback, useEffect, useRef, useState } from 'react';

import { clampWidth } from '@shared/hooks/use-sidebar-width';

import { cn } from '@shared/utils/cn';

import { useSidebarWidthContext } from './sidebar-context';

type Props = {
  className?: string;
};

const SidebarResizeHandle = ({ className }: Props) => {
  const { width, setWidth, isResizing, setIsResizing } = useSidebarWidthContext();
  const [currentWidth, setCurrentWidth] = useState(width);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Update local width when store width changes (from localStorage restore)
  useEffect(() => {
    setCurrentWidth(width);
  }, [width]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;
      setIsResizing(true);

      // Add styles to prevent text selection during resize
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [currentWidth, setIsResizing]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) {
        return;
      }

      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      const clampedWidth = clampWidth(newWidth);
      // Update local width for smooth UI updates and stream to hook
      setCurrentWidth(clampedWidth);
      setWidth(clampedWidth);
    },
    [isResizing, setWidth]
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizing) {
      return;
    }

    setIsResizing(false);

    // Restore default cursor and text selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizing, setIsResizing]);

  // Add global mouse event listeners when resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      startWidthRef.current = currentWidth;
      setIsResizing(true);
    },
    [currentWidth, setIsResizing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isResizing) {
        return;
      }
      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      const clampedWidth = clampWidth(newWidth);
      // Update local width for smooth UI updates and stream to hook
      setCurrentWidth(clampedWidth);
      setWidth(clampedWidth);
    },
    [isResizing, setWidth]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isResizing) {
      return;
    }
    setIsResizing(false);
  }, [isResizing, setIsResizing]);

  // Add global touch event listeners when resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isResizing, handleTouchMove, handleTouchEnd]);

  // CSS variable is automatically updated by SidebarProvider when width changes

  return (
    <div
      className={cn(
        `hover:bg-border active:bg-border absolute top-0 right-0 bottom-0 z-50 w-1
        cursor-col-resize bg-transparent transition-colors duration-200`,
        isResizing && 'bg-border',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
    />
  );
};

export default SidebarResizeHandle;
