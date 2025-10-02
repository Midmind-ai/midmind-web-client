import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import NotePage from '../../features/note/note';
import { useNotesStore } from '../../features/note/stores/notes.store';
import { ItemTypeEnum, type Item } from '../../services/items/items-dtos';
import { ItemsService } from '../../services/items/items-service';

export const ItemRouter = () => {
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    async function loadItem() {
      const fetchedItem = await ItemsService.getItem(id || '');
      setItem(fetchedItem);

      // Initialize note store for note/prompt types
      if (
        fetchedItem.type === ItemTypeEnum.Note ||
        fetchedItem.type === ItemTypeEnum.Prompt
      ) {
        useNotesStore.getState().initNote(fetchedItem.id, fetchedItem);
      }
    }

    loadItem();
  }, [id]);

  if (!item) return <div>Loading...</div>;

  if (item.type === ItemTypeEnum.Note) return <NotePage noteId={item.id} />;
  if (item.type === ItemTypeEnum.Prompt) return <NotePage noteId={item.id} />;
  if (item.type === ItemTypeEnum.Chat) return <div>Chat page</div>;
  if (item.type === ItemTypeEnum.Folder) return <div>Folder page</div>;
  if (item.type === ItemTypeEnum.Project) return <div>Project page</div>;
};
