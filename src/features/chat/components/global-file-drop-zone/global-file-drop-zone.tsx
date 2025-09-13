import { CloudUploadIcon } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { SUPPORTED_FORMATS } from '@constants/files';
import type { SupportedFileFormat } from '@constants/files';
import { cn } from '@utils/cn';

type Props = {
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  acceptedTypes?: SupportedFileFormat[];
  maxFiles?: number;
  onFilesSelected?: (files: FileList | null) => void;
};

const GlobalFileDropZone = ({
  onFilesSelected,
  className,
  disabled,
  children,
  acceptedTypes = [...SUPPORTED_FORMATS],
  maxFiles,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const filterFiles = useCallback(
    (files: FileList): FileList => {
      if (acceptedTypes.length === 0) return files;

      const allowedTypes = acceptedTypes;
      const filteredFiles = Array.from(files).filter(file => {
        return allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            const category = type.replace('/*', '');

            return file.type.startsWith(category + '/');
          }

          return file.type === type;
        });
      });

      const dataTransfer = new DataTransfer();
      filteredFiles.slice(0, maxFiles || filteredFiles.length).forEach(file => {
        dataTransfer.items.add(file);
      });

      return dataTransfer.files;
    },
    [acceptedTypes, maxFiles]
  );

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current++;

    if (e.dataTransfer?.items) {
      const hasFiles = Array.from(e.dataTransfer.items).some(
        item => item.kind === 'file'
      );
      if (hasFiles) {
        setIsDragOver(true);
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current--;

    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragOver(false);
      dragCounterRef.current = 0;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const filteredFiles = filterFiles(files);
        if (filteredFiles.length > 0) {
          onFilesSelected?.(filteredFiles);
        }
      }
    },
    [onFilesSelected, filterFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const filteredFiles = filterFiles(files);
        if (filteredFiles.length > 0) {
          onFilesSelected?.(filteredFiles);
        }
      }
      e.target.value = '';
    },
    [onFilesSelected, filterFiles]
  );

  useEffect(() => {
    if (disabled) return;

    const handleGlobalDragEnter = (e: DragEvent) => handleDragEnter(e);
    const handleGlobalDragLeave = (e: DragEvent) => handleDragLeave(e);
    const handleGlobalDragOver = (e: DragEvent) => handleDragOver(e);
    const handleGlobalDrop = (e: DragEvent) => handleDrop(e);

    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [disabled, handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={!maxFiles || maxFiles > 1}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      {children}
      {isDragOver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10
            backdrop-blur-md"
        >
          <div className="group relative">
            <div className="bg-primary/20 absolute inset-0 -m-16 rounded-full blur-2xl"></div>
            <div className="bg-muted/20 absolute inset-0 -m-8 rounded-full blur-xl"></div>
            <div
              className="border-border/30 bg-card/80 relative rounded-3xl border p-12
                text-center shadow-2xl backdrop-blur-xl"
            >
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="bg-primary/40 absolute inset-0 rounded-full opacity-60
                      blur-xl"
                  />
                  <div
                    className="from-primary via-ring to-muted-foreground relative flex
                      h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br
                      shadow-2xl"
                  >
                    <CloudUploadIcon className="text-primary-foreground h-10 w-10" />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3
                  className="from-foreground via-primary to-muted-foreground
                    bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent"
                >
                  Drop Files Here
                </h3>
                <div className="mt-4">
                  <p
                    className="text-muted-foreground mx-auto max-w-xs text-sm
                      leading-relaxed font-light"
                  >
                    Drag and drop your files to add them to the conversation
                  </p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2">
                    <p
                      className="text-muted-foreground text-xs font-semibold tracking-wide
                        uppercase"
                    >
                      Supported formats
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {acceptedTypes.map((type, index) => (
                      <span
                        key={index}
                        className="from-primary/5 via-primary/10 to-primary/5 text-primary
                          border-primary/20 relative rounded-lg border bg-gradient-to-r
                          px-3 py-1.5 text-xs font-medium shadow-sm"
                      >
                        {type.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalFileDropZone;
