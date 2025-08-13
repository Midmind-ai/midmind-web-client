import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BaseModalProps } from '@/constants/modals';
import { useModalActions } from '@/hooks/use-modal-actions';

export type TestModalProps = {
  title: string;
  description: string;
} & BaseModalProps;

const TestModal = ({ open, onAnimationEnd, title, description }: TestModalProps) => {
  const { closeModal } = useModalActions();

  return (
    <Dialog
      open={open}
      onOpenChange={() => closeModal('TestModal')}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onAnimationEnd={onAnimationEnd}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={() => closeModal('TestModal')}
            variant="outline"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestModal;
