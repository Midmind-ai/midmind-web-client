import { Button } from '@shared/components/Button';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';
import { useModalActions } from '@/shared/hooks/useModalActions';

const Home = () => {
  const { createChat, isLoading } = useCreateChat();
  const { openModal } = useModalActions();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gap-4">
      <Button
        disabled={isLoading}
        onClick={createChat}
      >
        Create chat
      </Button>
      <Button
        onClick={() =>
          openModal('TestModal', {
            title: 'Test Modal',
            description: 'This is a test modal',
          })
        }
      >
        Open modal
      </Button>
    </div>
  );
};

export default Home;
