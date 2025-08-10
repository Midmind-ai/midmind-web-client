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
