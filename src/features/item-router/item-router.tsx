import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ItemTypeEnum } from '../../services/items/items-dtos';
import { ItemsService } from '../../services/items/items-service';

export const ItemRouter = () => {
  const { id } = useParams();
  const [type, setType] = useState<string>('null');

  useEffect(() => {
    async function loadItem() {
      const item = await ItemsService.getItem(id || '');
      const { type } = item;
      setType(type);
    }

    loadItem();
  }, [id]);

  if (type === ItemTypeEnum.Note) return <div>Note page</div>;
  if (type === ItemTypeEnum.Chat) return <div>Chat page</div>;
  if (type === ItemTypeEnum.Folder) return <div>Folder page</div>;
  if (type === ItemTypeEnum.Prompt) return <div>Prompt page (placeholder)</div>;
};
