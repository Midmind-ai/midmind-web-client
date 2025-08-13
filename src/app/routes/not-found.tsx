import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { ThemedH1 } from '@/components/ui/themed-h1';
import { ThemedP } from '@/components/ui/themed-p';
import { AppRoutes } from '@/constants/router';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(AppRoutes.Home, { replace: true });
  };

  return (
    <div
      className="bg-background flex min-h-screen flex-col items-center justify-center p-4"
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="text-muted-foreground/20 mb-6 text-8xl font-bold">404</div>
        <ThemedH1 className="mb-4 text-2xl font-semibold">Page Not Found</ThemedH1>
        <ThemedP className="text-muted-foreground mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </ThemedP>
        <Button
          onClick={handleGoHome}
          size="lg"
          className="px-8"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
