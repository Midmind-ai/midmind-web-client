import { useSWRConfig as originalUseSWRConfig } from 'swr';

import { createMutateWithLogging } from './mutate';

// Wrapped useSWRConfig hook that provides logging for the mutate function
export const useSWRConfig = () => {
  const config = originalUseSWRConfig();

  // Wrap the config's mutate function with logging using the shared wrapper
  const mutate = createMutateWithLogging(config.mutate);

  // Return the config with wrapped mutate function
  return {
    ...config,
    mutate,
  };
};
