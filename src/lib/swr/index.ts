// Re-export all SWR types and utilities unchanged
export * from 'swr';
export type { SWRInfiniteResponse } from 'swr/infinite';
export type { SWRMutationResponse } from 'swr/mutation';
export { SWRConfig, useSWRConfig } from 'swr';
export type { KeyedMutator, SWRConfiguration, SWRResponse } from 'swr';

// Export wrapped functions with logging
export { useSWR } from './wrappers/use-swr';
export { useSWRInfinite } from './wrappers/use-swr-infinite';
export { useSWRMutation } from './wrappers/use-swr-mutation';
export { mutate } from './wrappers/mutate';

// Export logger configuration
export {
  configureSWRLogger,
  resetSWRLoggerConfig,
  getSWRLoggerConfig,
} from './logger/config';
export type { SWRLoggerConfig, LogVerbosity, LogEntry } from './logger/types';
export { getSWRLogger } from './logger';

// Export formatters for advanced usage
export { builtInFormatters, getFormatter } from './logger/formatters';

// Auto-initialize keyboard shortcut listener when module loads
import { initializeKeyboardShortcut } from './keyboard/shortcut-listener';

if (
  typeof window !== 'undefined' &&
  (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production')
) {
  // Use setTimeout to ensure it runs after the main thread
  setTimeout(() => {
    initializeKeyboardShortcut();
  }, 0);
}
