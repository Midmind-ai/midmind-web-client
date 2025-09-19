import { useState } from 'react';
import NavigationHeader from '@components/misc/navigation-header/navigation-header';
import InlineEditableText from '@components/ui/inline-editable-text';

const NotePage = () => {
  const [noteTitle, setNoteTitle] = useState('New note');

  const handleSave = (newValue: string) => {
    setNoteTitle(newValue);
  };

  return (
    <div className="flex h-full flex-col">
      <NavigationHeader
        id={'58ef7159-c2ee-4bbd-a1c5-49b3b90a7ec0'}
        showSidebarToggle
      />
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 py-10">
          <InlineEditableText
            value={noteTitle}
            onSave={handleSave}
            className="text-4xl font-semibold"
            placeholder="Enter note title..."
            clickToEdit
          />
          <div>Content</div>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
