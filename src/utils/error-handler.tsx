import { toast } from 'sonner';

export const handleSWRError = (error: unknown) => {
  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Error';

  if (error instanceof Error) {
    // Check for Axios errors
    if ('response' in error && typeof error.response === 'object' && error.response) {
      const response = error.response as {
        status: number;
        data?: { message?: string };
      };

      // Handle different HTTP status codes
      switch (response.status) {
        case 400:
          errorTitle = 'Bad Request';
          errorMessage = response.data?.message || 'Invalid request data';
          break;
        case 401:
          errorTitle = 'Authentication Error';
          errorMessage = 'Please sign in to continue';
          break;
        case 403:
          errorTitle = 'Permission Denied';
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorTitle = 'Not Found';
          errorMessage = response.data?.message || 'The requested resource was not found';
          break;
        case 500:
          errorTitle = 'Server Error';
          errorMessage = 'Something went wrong on our end. Please try again later';
          break;
        default:
          errorMessage = response.data?.message || error.message;
      }
    } else {
      // Regular error
      errorMessage = error.message;
    }
  }

  // Show error toast with Sonner
  toast.error(errorMessage, {
    description: errorTitle !== 'Error' ? errorTitle : undefined,
    duration: 3000,
  });
};
