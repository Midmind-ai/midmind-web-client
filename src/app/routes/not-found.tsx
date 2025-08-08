import { useNavigate } from 'react-router';

import { Button } from '@shared/components/ui/button';
import { ThemedH1 } from '@shared/components/ui/themed-h1';
import { ThemedP } from '@shared/components/ui/themed-p';

import { AppRoutes } from '@shared/constants/router';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(AppRoutes.Home);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 text-8xl font-bold text-muted-foreground/20">404</div>
        <ThemedH1 className="mb-4 text-2xl font-semibold">Page Not Found</ThemedH1>
        <ThemedP className="mb-8 text-muted-foreground">
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

export default NotFound;
