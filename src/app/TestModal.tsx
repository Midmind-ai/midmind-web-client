import { Button } from '@/shared/components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/Dialog';
import { useModalsStore } from '@/shared/stores/useModalsStore';

type Props = {
  open?: boolean;
  onAnimationEnd?: () => void;
};

export function TestModal({ open, onAnimationEnd }: Props) {
  const { closeModal, openModal } = useModalsStore();

  const handleOpenNestedModal = () => {
    openModal('NestedModal');
  };

  const handleClose = () => {
    closeModal('TestModal');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent onAnimationEnd={onAnimationEnd}>
        <DialogHeader>
          <DialogTitle>Test Modal</DialogTitle>
          <DialogDescription>some description</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button onClick={handleOpenNestedModal}>Open nested modal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
