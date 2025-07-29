import { Button } from '@shared/components/Button';

import { useCreateChat } from '@/features/Chat/hooks/useCreateChat';

const Home = () => {
  const { createChat, isLoading } = useCreateChat();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gap-4">
      <Button
        disabled={isLoading}
        onClick={createChat}
      >
        Create chat
      </Button>
    </div>
  );
};

export default Home;
