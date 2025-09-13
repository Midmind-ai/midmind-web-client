import { XIcon } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { useModalOperations } from '@hooks/logic/use-modal-operations';
import { type BaseModalProps } from '@shared-types/modals';

export type FileViewModalProps = {
  fileUrl: string;
} & BaseModalProps;

const FileViewModal = ({ fileUrl, open, onAnimationEnd }: FileViewModalProps) => {
  const { closeModal } = useModalOperations();

  const handleClose = () => {
    closeModal('FileViewModal');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      https://stackoverflow.com/questions/78728076/shadcn-dialogcontent-requires-a-dialogtitle-for-the-component-to-be-accessib
      <DialogTitle className="sr-only" />
      <DialogContent
        className="flex h-screen min-w-full items-center justify-center border-none
          bg-transparent p-0 shadow-none outline-none"
        onAnimationEnd={onAnimationEnd}
        showCloseButton={false}
        onClick={handleClose}
        aria-describedby="file-view-modal"
      >
        <img
          onClick={e => e.stopPropagation()}
          src={fileUrl}
          alt="File"
          className="mx-auto my-auto max-h-[80vh] max-w-[80vw] object-contain"
        />
        <Button
          onClick={handleClose}
          variant="secondary"
          className="absolute top-7 right-7 size-9"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewModal;
