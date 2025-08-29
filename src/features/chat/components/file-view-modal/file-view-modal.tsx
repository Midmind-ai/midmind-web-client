import { Dialog, DialogContent } from '@components/ui/dialog';

import { useModalOperations } from '@hooks/logic/use-modal-operations';

import { type BaseModalProps } from '@shared-types/modal';

export type FileViewModalProps = {
  file: File;
} & BaseModalProps;

const FileViewModal = ({ file, open, onAnimationEnd }: FileViewModalProps) => {
  const { closeModal } = useModalOperations();

  return (
    <Dialog
      open={open}
      onOpenChange={() => closeModal('FileViewModal')}
    >
      <DialogContent
        tabIndex={0}
        className="h-full w-full max-w-none border-none bg-transparent p-6 shadow-none"
        onAnimationEnd={onAnimationEnd}
        showCloseButton={false}
      >
        <img
          src={URL.createObjectURL(file)}
          alt="File"
          className="h-full w-full object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};

export default FileViewModal;
