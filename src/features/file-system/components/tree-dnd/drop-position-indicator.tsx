import { cn } from '@utils/cn';

interface DropPositionIndicatorProps {
  isVisible: boolean;
  position: 'before' | 'after' | 'inside';
  orientation?: 'horizontal' | 'vertical';
}

export const DropPositionIndicator = ({
  isVisible,
  position,
}: DropPositionIndicatorProps) => {
  if (!isVisible || position === 'inside') return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-0 left-0 z-30 h-[1px] bg-blue-300 shadow-md',
        position === 'before' && '-top-[-0.5px]',
        position === 'after' && '-bottom-[-0.5px]'
      )}
    >
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
