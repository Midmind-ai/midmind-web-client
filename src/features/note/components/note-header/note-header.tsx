import InlineEditableText from '@components/ui/inline-editable-text';

interface NoteHeaderProps {
  name: string;
  onNameChange: (newName: string) => void;
}

export const NoteHeader = ({ name, onNameChange }: NoteHeaderProps) => {
  return (
    <InlineEditableText
      value={name}
      onSave={onNameChange}
      className="text-4xl font-semibold"
      placeholder="Untitled note"
      clickToEdit
    />
  );
};
