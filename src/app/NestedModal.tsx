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

export function NestedModal({ open = true, onAnimationEnd }: Props) {
  const closeModal = useModalsStore(state => state.closeModal);
  const closeAllModals = useModalsStore(state => state.closeAllModals);

  const handleClose = () => {
    closeModal('NestedModal');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent
        onAnimationEnd={onAnimationEnd}
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle>Nested Modal</DialogTitle>
          <DialogDescription>some description</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={closeAllModals}>Close all</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
