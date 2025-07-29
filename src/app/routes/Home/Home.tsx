import { Button } from '@shared/components/Button';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';
import { useModalsStore } from '@/shared/stores/useModalsStore';

const Home = () => {
  const { createChat, isLoading } = useCreateChat();
  const { openModal } = useModalsStore();

  const handleOpenTestModal = () => {
    openModal('TestModal');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gap-4">
      <Button
        disabled={isLoading}
        onClick={createChat}
      >
        Create chat
      </Button>
      <Button onClick={handleOpenTestModal}>Open Test Modal</Button>
    </div>
  );
};

export default Home;
