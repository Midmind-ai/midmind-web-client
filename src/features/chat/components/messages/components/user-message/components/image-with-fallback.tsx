import { ImageIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@utils/cn';

type Props = {
  src: string;
  alt: string;
  className?: string;
  role?: string;
  fallbackComponent?: ReactNode;
  onClick?: () => void;
};

const ImageWithFallback = ({
  src,
  alt,
  className,
  role,
  fallbackComponent,
  onClick,
}: Props) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div
        className={cn(
          `border-muted-foreground/30 bg-muted/20 flex h-32 w-48 max-w-2xs items-center
          justify-center rounded-lg border-2 border-dashed p-3`,
          className
        )}
      >
        <div className="flex w-full flex-col items-center gap-1.5">
          <ImageIcon className="text-muted-foreground h-6 w-6" />
          <div className="text-muted-foreground text-sm font-medium">
            Image unavailable
          </div>
          <div className="w-full max-w-full">
            <div
              className="text-muted-foreground overflow-hidden text-center text-xs
                text-ellipsis whitespace-nowrap"
            >
              {alt}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      onClick={onClick}
      role={role}
      className={cn(
        'h-auto w-auto cursor-pointer rounded-lg object-cover shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
    />
  );
};

export default ImageWithFallback;
