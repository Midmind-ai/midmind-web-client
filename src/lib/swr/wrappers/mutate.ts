import { mutate as originalMutate, type Key, type MutatorOptions } from 'swr';

import { getSWRLogger } from '../logger';

// Wrapped mutate with logging
export const mutate = async <Data = unknown>(
  key: Key,
  data?: Data | Promise<Data> | ((currentData?: Data) => Data | Promise<Data>),
  options?: MutatorOptions<Data>
): Promise<Data | undefined> => {
  const logger = getSWRLogger();

  // Check if key is a filter function (for multiple keys)
  if (typeof key === 'function') {
    const resolvedData = await Promise.resolve(data);

    // Call original mutate
    const result = await originalMutate(key, data, options);

    // Log filter function mutation
    const matchedKeys = Array.isArray(result) ? result.length : 0;
    logger.logMutate('filter-function', resolvedData, options, result, matchedKeys);

    return result;
  }

  // Single key mutation
  const resolvedData = await Promise.resolve(data);

  // Call original mutate
  const result = await originalMutate(key, data, options);

  // Log single key mutation
  logger.logMutate(String(key), resolvedData, options, result);

  return result;
};
