import { XIcon } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Progress } from '@components/ui/progress';

type Props = {
  file: File;
  progress: number;
  isUploading?: boolean;
  onRemove: VoidFunction;
  onClick: VoidFunction;
};

const ImageUploadProgress = ({
  file,
  progress,
  onRemove,
  onClick,
  isUploading = false,
}: Props) => {
  return (
    <div
      className="group relative cursor-pointer"
      role="button"
      onClick={onClick}
    >
      <div className="relative size-[50px] overflow-hidden rounded-md">
        <img
          src={URL.createObjectURL(file)}
          alt={`Preview ${file.name}`}
          className="size-full object-cover"
        />
        {isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50
              backdrop-blur-sm"
          >
            <div className="text-xs font-medium text-white">{Math.round(progress)}%</div>
          </div>
        )}
        {isUploading && (
          <div className="absolute right-0 bottom-0 left-0 bg-black/40 p-1">
            <Progress
              value={progress}
              className="h-1.5 [&>div]:bg-white [&>div]:transition-all
                [&>div]:duration-300"
            />
          </div>
        )}
      </div>

      {!isUploading && (
        <Button
          type="button"
          className="absolute top-1 right-1 size-3 rounded-[2px] p-0 opacity-0
            transition-opacity group-hover:opacity-100"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove image ${file.name}`}
        >
          <span>
            <XIcon className="size-2" />
          </span>
        </Button>
      )}
    </div>
  );
};

export default ImageUploadProgress;
