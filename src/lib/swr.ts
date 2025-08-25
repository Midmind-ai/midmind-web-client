/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { useRef } from 'react';

// Import specific hooks to wrap
import {
  useSWRConfig as useOriginalSWRConfig,
  unstable_serialize,
  mutate as originalMutate,
  default as useOriginalSWR,
} from 'swr';
import { default as useOriginalSWRInfinite } from 'swr/infinite';
import { default as useOriginalSWRMutation } from 'swr/mutation';

// Re-export everything from SWR first (except what we're wrapping)
export * from 'swr';

// Check if mutation logging is enabled
const getDebugStatus = () =>
  typeof window !== 'undefined' &&
  process.env.NODE_ENV !== 'production' &&
  localStorage.getItem('debug:mutations');

const logMutationStart = (key: any, currentData?: any, optimisticData?: any) => {
  if (!getDebugStatus()) return;

  console.group(
    `%c🔄 SWR Mutate: ${JSON.stringify(key)}`,
    'color: #0EA5E9; font-weight: bold'
  );
  console.log('📊 Previous:', currentData);

  if (optimisticData !== undefined) {
    console.log('✨ Optimistic:', optimisticData);
  }
};

const logMutationEnd = (result: any, error?: any, duration?: number) => {
  if (!getDebugStatus()) return;

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Final:', result);
  }

  if (duration) {
    console.log(`⏱️ Duration: ${duration}ms`);
  }

  console.groupEnd();
};

// Create wrapped mutate function for useSWRConfig
const createWrappedMutate = (originalMutate: any, cache: any) => {
  return async function wrappedMutate(
    key: any,
    data?: any | Promise<any> | ((currentData?: any) => any | Promise<any>),
    opts?: any
  ) {
    if (!getDebugStatus()) {
      return originalMutate(key, data, opts);
    }

    const startTime = performance.now();

    try {
      // Get current cache data
      let currentData;
      try {
        const serializedKey = unstable_serialize(key);
        currentData = cache.get(serializedKey)?.data;
      } catch {
        currentData = undefined;
      }

      // Check for optimistic update
      const hasOptimistic = opts && typeof opts === 'object' && 'optimisticData' in opts;
      const optimisticData = hasOptimistic
        ? typeof opts.optimisticData === 'function'
          ? opts.optimisticData(currentData)
          : opts.optimisticData
        : undefined;

      logMutationStart(key, currentData, optimisticData);

      const result = await originalMutate(key, data, opts);
      const duration = Math.round(performance.now() - startTime);

      logMutationEnd(result, undefined, duration);

      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      logMutationEnd(undefined, error, duration);
      throw error;
    }
  };
};

// Enhanced useSWRConfig with mutation logging
export const useSWRConfig = () => {
  const config = useOriginalSWRConfig();
  const wrappedMutateRef = useRef<any>(null);

  if (!wrappedMutateRef.current && getDebugStatus()) {
    wrappedMutateRef.current = createWrappedMutate(config.mutate, config.cache);
  }

  if (!getDebugStatus()) {
    return config;
  }

  return {
    ...config,
    mutate: wrappedMutateRef.current || config.mutate,
  };
};

// Enhanced useSWR with fetch logging and grouping
export const useSWR = (key: any, fetcher?: any, options?: any) => {
  const startTime = useRef<number | null>(null);

  const result = useOriginalSWR(
    key,
    fetcher
      ? async (...args: any[]) => {
          if (!getDebugStatus()) {
            return fetcher(...args);
          }

          const fetchStartTime = performance.now();
          startTime.current = fetchStartTime;

          const serializedKey = JSON.stringify(key);
          console.group(
            `%c📡 SWR Fetch: ${serializedKey}`,
            'color: #8B5CF6; font-weight: bold'
          );
          console.log('🔑 Key:', key);
          console.log('⏰ Started:', new Date().toLocaleTimeString());

          try {
            const data = await fetcher(...args);
            const duration = Math.round(performance.now() - fetchStartTime);

            console.log('✅ Success:', data);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.groupEnd();

            return data;
          } catch (error) {
            const duration = Math.round(performance.now() - fetchStartTime);

            console.error('❌ Error:', error);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.groupEnd();

            throw error;
          }
        }
      : fetcher,
    options
  );

  return result;
};

// Enhanced useSWRMutation with mutation logging
export const useSWRMutation = (key: any, fetcher: any, options?: any) => {
  const result = useOriginalSWRMutation(
    key,
    async (url: any, { arg }: { arg: any }) => {
      if (!getDebugStatus()) {
        return fetcher(url, { arg });
      }

      const startTime = performance.now();
      const serializedKey = JSON.stringify(key);

      console.group(
        `%c🚀 SWR Mutation: ${serializedKey}`,
        'color: #F59E0B; font-weight: bold'
      );
      console.log('🔑 Key:', key);
      console.log('📦 Args:', arg);
      console.log('⏰ Started:', new Date().toLocaleTimeString());

      try {
        const result = await fetcher(url, { arg });
        const duration = Math.round(performance.now() - startTime);

        console.log('✅ Success:', result);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.groupEnd();

        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);

        console.error('❌ Error:', error);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.groupEnd();

        throw error;
      }
    },
    options
  );

  return result;
};

// Enhanced useSWRInfinite with infinite scroll logging
export const useSWRInfinite = (getKey: any, fetcher?: any, options?: any) => {
  const result = useOriginalSWRInfinite(
    getKey,
    fetcher
      ? async (...args: any[]) => {
          if (!getDebugStatus()) {
            return fetcher(...args);
          }

          const startTime = performance.now();
          const pageKey = args[0]; // First arg is the page key

          console.group(
            `%c📜 SWR Infinite: ${JSON.stringify(pageKey)}`,
            'color: #10B981; font-weight: bold'
          );
          console.log('🔑 Page Key:', pageKey);
          console.log('⏰ Started:', new Date().toLocaleTimeString());

          try {
            const data = await fetcher(...args);
            const duration = Math.round(performance.now() - startTime);

            console.log('✅ Success:', data);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.groupEnd();

            return data;
          } catch (error) {
            const duration = Math.round(performance.now() - startTime);

            console.error('❌ Error:', error);
            console.log(`⏱️ Duration: ${duration}ms`);
            console.groupEnd();

            throw error;
          }
        }
      : fetcher,
    options
  );

  return result;
};

// Enhanced global mutate with logging
export const mutate = (...args: Parameters<typeof originalMutate>) => {
  if (!getDebugStatus()) {
    return originalMutate(...args);
  }

  const [key] = args;
  console.log(
    `%c⚡ Global Mutate: ${JSON.stringify(key)}`,
    'color: #EF4444; font-weight: bold'
  );

  return originalMutate(...args);
};

// Setup keyboard shortcuts and console helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const setupShortcuts = () => {
    document.addEventListener(
      'keydown',
      event => {
        const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
        const modifierKey = isMac ? event.metaKey : event.ctrlKey;

        if (modifierKey && event.shiftKey && (event.key === 'L' || event.key === 'l')) {
          event.preventDefault();
          event.stopPropagation();

          const current = localStorage.getItem('debug:mutations');
          if (!current) {
            localStorage.setItem('debug:mutations', '1');
            console.log('%c✅ SWR Logging ENABLED. Refreshing...', 'color: #10B981');
          } else {
            localStorage.removeItem('debug:mutations');
            console.log('%c❌ SWR Logging DISABLED. Refreshing...', 'color: #EF4444');
          }

          setTimeout(() => window.location.reload(), 100);
        }
      },
      true
    );
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupShortcuts);
  } else {
    setupShortcuts();
  }

  // Console helpers
  (window as any).enableSWRLogging = () => {
    localStorage.setItem('debug:mutations', '1');
    console.log('%c✅ SWR logging enabled. Refreshing...', 'color: #10B981');
    setTimeout(() => window.location.reload(), 100);
  };

  (window as any).disableSWRLogging = () => {
    localStorage.removeItem('debug:mutations');
    console.log('%c❌ SWR logging disabled. Refreshing...', 'color: #EF4444');
    setTimeout(() => window.location.reload(), 100);
  };

  // Show status
  if (getDebugStatus()) {
    console.log(
      '%c🔍 Enhanced SWR Logging is ACTIVE',
      'color: #0EA5E9; font-weight: bold'
    );
    console.log('%c   📡 Data fetching: useSWR calls', 'color: #8B5CF6');
    console.log('%c   🔄 Cache mutations: useSWRConfig().mutate calls', 'color: #0EA5E9');
    console.log('%c   🚀 Mutations: useSWRMutation triggers', 'color: #F59E0B');
    console.log('%c   ⚡ Global mutate: Direct mutate() calls', 'color: #EF4444');
    console.log('%c   Press Cmd+Shift+L to toggle', 'color: #6B7280');
  } else {
    console.log(
      '%c💡 Press Cmd+Shift+L to enable comprehensive SWR logging',
      'color: #6B7280; font-size: 11px'
    );
  }
}
