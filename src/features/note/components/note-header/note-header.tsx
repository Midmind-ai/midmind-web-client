import { ItemTypeEnum } from '../../../../services/items/items-dtos';
import InlineEditableText from '@components/ui/inline-editable-text';

interface NoteHeaderProps {
  name: string;
  type: ItemTypeEnum;
  onNameChange: (newName: string) => void;
}

export const NoteHeader = ({ name, type, onNameChange }: NoteHeaderProps) => {
  const promptClassNames =
    'underline decoration-amber-500 decoration-2 underline-offset-4';

  return (
    <div className={'relative px-30'}>
      <InlineEditableText
        value={name}
        onSave={onNameChange}
        className={`flex w-full text-4xl font-semibold ${
          type === ItemTypeEnum.Prompt ? promptClassNames : ''
        }`}
        placeholder="Untitled note"
        clickToEdit
      />
    </div>
  );
};
