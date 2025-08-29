 
import originalUseSWR, {
  type SWRResponse,
  type Key,
  useSWRConfig,
  type Cache,
} from 'swr'

import { getSWRLogger } from '../logger'

// Helper to get cache value
const getCacheValue = (cache: Cache<unknown>, key: Key): unknown => {
  if (typeof key === 'string') {
    return cache.get(key)
  }
  // For complex keys, SWR serializes them internally
  const serializedKey = JSON.stringify(key)

  return cache.get(serializedKey)
}

// Wrapped useSWR with logging
export const useSWR = <Data = unknown, Error = unknown>(
  key: Key,
  fetcher?: unknown,
  config?: unknown
): SWRResponse<Data, Error> => {
  // Get cache instance and logger
  const { cache } = useSWRConfig()
  const logger = getSWRLogger()

  // Capture before state
  const beforeData = key ? getCacheValue(cache, key) : undefined

  // Call original useSWR with enhanced config
  const result = originalUseSWR(
    key,
    fetcher as never,
    {
      ...(config as Record<string, unknown>),
      onSuccess: (data: Data) => {
        // Log the cache change
        const keyStr = String(key ?? 'undefined')
        logger.logUseSWR(keyStr, beforeData, data)

        // Call original onSuccess if provided
        const originalConfig = config as { onSuccess?: (data: Data) => void }
        originalConfig?.onSuccess?.(data)
      },
    } as never
  )

  return result as SWRResponse<Data, Error>
}
