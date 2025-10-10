import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import NotePage from '../../features/note/note';
import { useNotesStore } from '../../features/note/stores/notes.store';
import { ItemTypeEnum, type Item } from '../../services/items/items-dtos';
import { ItemsService } from '../../services/items/items-service';
import Chat from '../chat/chat';
import { useChatsStore } from '../chat/stores/chats.store';
import NavigationHeader from '@components/misc/navigation-header/navigation-header';

type Props = {
  isInRightPanel?: boolean;
};

export const ItemRouter = ({ isInRightPanel }: Props) => {
  const { id: paramId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const splitId = searchParams.get('split');
  const id = isInRightPanel ? splitId : paramId;

  const [item, setItem] = useState<Item | null>(null);

  // Detect if we're in split panel mode
  const isInSplitMode = !!splitId;

  // Handler to close split panel
  const handleCloseSplit = () => {
    if (isInRightPanel) {
      // Closing right panel: just remove split param
      searchParams.delete('split');
      setSearchParams(searchParams);
    } else {
      // Closing left panel: navigate to split item, then remove split param
      if (splitId) {
        navigate(`/item/${splitId}`);
      }
    }
  };

  useEffect(() => {
    async function loadItem() {
      const fetchedItem = await ItemsService.getItem(id || '');
      setItem(fetchedItem);

      // Set page title
      if (!isInRightPanel && fetchedItem.payload?.name) {
        document.title = fetchedItem.payload?.name;
      }

      // Initialize store based on item type
      switch (fetchedItem.type) {
        case ItemTypeEnum.Note:
        case ItemTypeEnum.Prompt:
          useNotesStore.getState().initNote(fetchedItem.id, fetchedItem);
          break;
        case ItemTypeEnum.Chat:
          useChatsStore.getState().initChatData(fetchedItem.id);
          break;
      }
    }

    loadItem();
  }, [id, isInRightPanel]);

  if (!item) return <div>Loading...</div>;

  // Render content based on item type
  let content;
  switch (item.type) {
    case ItemTypeEnum.Note:
    case ItemTypeEnum.Prompt:
      content = <NotePage noteId={item.id} />;
      break;
    case ItemTypeEnum.Chat:
      content = <Chat chatId={item.id} />;
      break;
    case ItemTypeEnum.Folder:
      content = <div>Folder page</div>;
      break;
    case ItemTypeEnum.Project:
      content = <div>Project page</div>;
      break;
    default:
      content = <div>Unknown item type</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <NavigationHeader
        id={id || ''}
        showSidebarToggle={paramId === id}
        showCloseButton={isInSplitMode}
        onClose={isInSplitMode ? handleCloseSplit : undefined}
      />
      <div className="flex-1 overflow-hidden">{content}</div>
    </div>
  );
};
