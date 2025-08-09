import { Button } from '@shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';

import type { BaseModalProps } from '@shared/constants/modals';

import { useModalActions } from '@shared/hooks/use-modal-actions';

const NestedModal = ({ open, onAnimationEnd }: BaseModalProps) => {
  const { closeModal, closeAllModals } = useModalActions();

  return (
    <Dialog
      open={open}
      onOpenChange={() => closeModal('NestedModal')}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onAnimationEnd={onAnimationEnd}
      >
        <DialogHeader>
          <DialogTitle>Nested Modal</DialogTitle>
          <DialogDescription>
            This is a nested modal demonstrating the modal system&apos;s ability to handle
            multiple modals.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={() => closeModal('NestedModal')}
            variant="outline"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={closeAllModals}
          >
            Close all modals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NestedModal;
