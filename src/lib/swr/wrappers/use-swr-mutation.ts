/* eslint-disable @typescript-eslint/no-explicit-any */

import originalUseSWRMutation from 'swr/mutation'

import { getSWRLogger } from '../logger'

// Simply re-export with logging wrapper
// We use any types to avoid complex type gymnastics with SWR's internal types
export const useSWRMutation = (key: any, fetcher: any, config?: any): any => {
  const logger = getSWRLogger()

  // Wrap the fetcher to add logging
  const wrappedFetcher = async (key: any, options: any) => {
    const keyStr = String(key ?? 'undefined')
    
    try {
      const result = await fetcher(key, options)
      
      // Log successful mutation
      logger.logMutate(keyStr, options.arg, config, result)
      
      return result
    } catch (error) {
      // Log failed mutation
      logger.logMutate(keyStr, options.arg, config, error)
      throw error
    }
  }

  return originalUseSWRMutation(key, wrappedFetcher, config)
}