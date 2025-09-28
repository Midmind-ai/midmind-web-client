import { cn } from '@utils/cn';

interface DropPositionIndicatorProps {
  isVisible: boolean;
  position: 'before' | 'after' | 'between' | 'inside';
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Visual indicator showing exactly where an item will be inserted during drag operations
 */
export const DropPositionIndicator = ({
  isVisible,
  position,
  // orientation = 'horizontal',
}: DropPositionIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-30 h-[1px] bg-blue-300 shadow-md',
        position === 'before' && '-top-[-0.5px]',
        position === 'after' && '-bottom-[-0.5px]',
        position === 'between' && 'top-1/2 -translate-y-1/2',
        position !== 'inside' && 'right-0 left-0 h-0.5',
        position === 'inside' && 'right-0 left-[30px] h-0.5',
        position === 'inside' && '-bottom-0 left-[30px]'
      )}
    >
      {/* Insertion point indicator */}
      <div
        className={cn(
          `absolute top-1/2 left-[0px] size-3 -translate-y-1/2 rounded-full bg-blue-300
          shadow-md`
        )}
      />
    </div>
  );
};

export default DropPositionIndicator;
