import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateDirectory } from '@features/sidebar/hooks/use-create-directory';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BaseModalProps } from '@/constants/modals';
import { useModalActions } from '@/hooks/use-modal-actions';

const createDirectorySchema = z.object({
  name: z.string().min(1, 'Directory name is required').trim(),
});

type CreateDirectoryFormData = z.infer<typeof createDirectorySchema>;

export type CreateDirectoryModalProps = {
  parentDirectoryId?: string;
} & BaseModalProps;

const CreateDirectoryModal = ({
  open,
  onAnimationEnd,
  parentDirectoryId,
}: CreateDirectoryModalProps) => {
  const { closeModal } = useModalActions();
  const { createDirectory, isCreating } = useCreateDirectory();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateDirectoryFormData>({
    resolver: zodResolver(createDirectorySchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateDirectoryFormData) => {
    await createDirectory({
      name: data.name,
      parentDirectoryId,
    });

    reset();
    closeModal('CreateDirectoryModal');
  };

  const handleClose = () => {
    reset();
    closeModal('CreateDirectoryModal');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onAnimationEnd={onAnimationEnd}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                placeholder="Enter folder name"
                {...register('name')}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDirectoryModal;
