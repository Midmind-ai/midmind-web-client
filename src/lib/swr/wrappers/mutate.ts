import { mutate as originalMutate, type Key, type MutatorOptions } from 'swr';

import { getSWRLogger } from '../logger';

// Generic mutate wrapper with logging that can wrap any mutate function
export const createMutateWithLogging = <Data = unknown>(
  mutateFn: (
    key: Key,
    data?: Data | Promise<Data> | ((currentData?: Data) => Data | Promise<Data>),
    options?: MutatorOptions<Data>
  ) => Promise<Data | undefined>
) => {
  return async (
    key: Key,
    data?: Data | Promise<Data> | ((currentData?: Data) => Data | Promise<Data>),
    options?: MutatorOptions<Data>
  ): Promise<Data | undefined> => {
    const logger = getSWRLogger();

    // Check if key is a filter function (for multiple keys)
    if (typeof key === 'function') {
      const resolvedData = await Promise.resolve(data);

      // Call the provided mutate function
      const result = await mutateFn(key, data, options);

      // Log filter function mutation
      const matchedKeys = Array.isArray(result) ? result.length : 0;
      logger.logMutate('filter-function', resolvedData, options, result, matchedKeys);

      return result;
    }

    // Single key mutation
    const resolvedData = await Promise.resolve(data);

    // Call the provided mutate function
    const result = await mutateFn(key, data, options);

    // Log single key mutation
    logger.logMutate(String(key), resolvedData, options, result);

    return result;
  };
};

// Wrapped standalone mutate with logging
export const mutate = createMutateWithLogging(originalMutate);
