// Re-export all SWR functions and types directly from the original SWR package
export * from 'swr';
export { default as useSWR } from 'swr';
export { default as useSWRInfinite } from 'swr/infinite';
export { default as useSWRMutation } from 'swr/mutation';
export { useSWRConfig, SWRConfig, mutate } from 'swr';

// Export types
export type { SWRInfiniteResponse } from 'swr/infinite';
export type { SWRMutationResponse } from 'swr/mutation';
export type { KeyedMutator, SWRConfiguration, SWRResponse } from 'swr';
