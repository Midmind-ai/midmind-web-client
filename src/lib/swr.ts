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

// Verbosity levels
type VerbosityLevel = 'off' | 'compact' | 'detailed';

// Check current verbosity level
const getVerbosityLevel = (): VerbosityLevel => {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return 'off';
  }
  const stored = localStorage.getItem('debug:swr-verbosity');

  return (stored as VerbosityLevel) || 'off';
};

// Check if any logging is enabled
const getDebugStatus = () => getVerbosityLevel() !== 'off';

const logMutationStart = (key: any, currentData?: any, optimisticData?: any) => {
  const verbosity = getVerbosityLevel();
  if (verbosity === 'off') return;

  const serializedKey = JSON.stringify(key);

  if (verbosity === 'compact') {
    // Just show the start of the mutation - end will be logged separately
    console.log(
      `%c🔄 MUTATE %c${serializedKey} %c📊 Previous: %c${summarizeData(currentData)}`,
      'color: #0EA5E9; font-weight: bold',
      'color: #6B7280',
      'color: #0EA5E9',
      'color: #6B7280'
    );

    if (optimisticData !== undefined) {
      console.log(
        `%c   %c✨ Optimistic: %c${summarizeData(optimisticData)}`,
        'color: transparent',
        'color: #0EA5E9',
        'color: #F59E0B'
      );
    }
  } else if (verbosity === 'detailed') {
    console.groupCollapsed(
      `%c🔄 SWR Mutate: %c${serializedKey}`,
      'color: #0EA5E9; font-weight: bold',
      'color: #6B7280; font-weight: normal'
    );
    console.log('📊 Previous:', currentData);

    if (optimisticData !== undefined) {
      console.log('✨ Optimistic:', optimisticData);
    }
  }
};

const logMutationEnd = (result: any, error?: any, duration?: number) => {
  const verbosity = getVerbosityLevel();
  if (verbosity === 'off') return;

  if (verbosity === 'compact') {
    const timing = duration ? ` (${duration}ms)` : '';

    if (error) {
      console.error(`%c   %c❌ Error:${timing}`, 'color: transparent', 'color: #EF4444');
    } else {
      console.log(
        `%c   %c✅ Final: %c${summarizeData(result)}${timing}`,
        'color: transparent',
        'color: #0EA5E9',
        'color: #10B981'
      );
    }
  } else if (verbosity === 'detailed') {
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Final:', result);
    }

    if (duration) {
      console.log(`⏱️ Duration: ${duration}ms`);
    }

    console.groupEnd();
  }
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

// Smart data summarization
const summarizeData = (data: any): string => {
  if (data === null) return 'null';
  if (data === undefined) return 'undefined';

  if (Array.isArray(data)) {
    if (data.length === 0) return '[]';
    if (data.length === 1) return '[1 item]';

    return `[${data.length} items]`;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return '{}';

    // Show key fields for common objects
    const keyFields = ['id', 'name', 'email', 'title', 'type'];
    const relevantKeys = keys.filter(key => keyFields.includes(key));

    if (relevantKeys.length > 0) {
      const preview = relevantKeys
        .slice(0, 2)
        .map(key => `${key}: ${JSON.stringify(data[key])}`)
        .join(', ');

      return `{${preview}${relevantKeys.length > 2 ? ', ...' : ''}}`;
    }

    return `{${keys.length} fields}`;
  }

  if (typeof data === 'string') {
    return data.length > 50 ? `"${data.slice(0, 47)}..."` : JSON.stringify(data);
  }

  return String(data);
};

// Enhanced useSWR with improved logging
export const useSWR = (key: any, fetcher?: any, options?: any) => {
  const result = useOriginalSWR(
    key,
    fetcher
      ? async (...args: any[]) => {
          const verbosity = getVerbosityLevel();
          if (verbosity === 'off') {
            return fetcher(...args);
          }

          const fetchStartTime = performance.now();
          const serializedKey = JSON.stringify(key);

          try {
            const data = await fetcher(...args);
            const duration = Math.round(performance.now() - fetchStartTime);

            if (verbosity === 'compact') {
              // Single line with timing
              console.log(
                `%c📡 GET %c${serializedKey} %c→ %c${summarizeData(data)} %c(${duration}ms)`,
                'color: #8B5CF6; font-weight: bold',
                'color: #6B7280',
                'color: #8B5CF6',
                'color: #10B981',
                'color: #6B7280; font-size: 11px'
              );
            } else if (verbosity === 'detailed') {
              // Collapsed group with clean summary line
              console.groupCollapsed(
                `%c📡 GET %c${serializedKey} %c→ %c${summarizeData(data)} %c(${duration}ms)`,
                'color: #8B5CF6',
                'color: #6B7280; font-weight: normal',
                'color: #8B5CF6; font-weight: normal',
                'color: #10B981; font-weight: normal',
                'color: #6B7280; font-weight: normal; font-size: 11px'
              );
              console.log('🔑 Full Key:', key);
              console.log('⏰ Started:', new Date().toLocaleTimeString());
              console.log('✅ Full Data:', data);
              console.log(`⏱️ Duration: ${duration}ms`);
              console.groupEnd();
            }

            return data;
          } catch (error) {
            const duration = Math.round(performance.now() - fetchStartTime);

            if (verbosity === 'compact') {
              console.error(
                `%c📡 GET %c${serializedKey} %c→ %c❌ Error %c(${duration}ms)`,
                'color: #8B5CF6; font-weight: bold',
                'color: #6B7280',
                'color: #8B5CF6',
                'color: #EF4444',
                'color: #6B7280; font-size: 11px'
              );
            } else if (verbosity === 'detailed') {
              console.groupCollapsed(
                `%c📡 GET %c${serializedKey} %c→ %c❌ Error %c(${duration}ms)`,
                'color: #8B5CF6; font-weight: normal',
                'color: #6B7280; font-weight: normal',
                'color: #8B5CF6; font-weight: normal',
                'color: #EF4444; font-weight: normal',
                'color: #6B7280; font-weight: normal; font-size: 11px'
              );
              console.log('🔑 Full Key:', key);
              console.log('⏰ Started:', new Date().toLocaleTimeString());
              console.error('❌ Full Error:', error);
              console.log(`⏱️ Duration: ${duration}ms`);
              console.groupEnd();
            }

            throw error;
          }
        }
      : fetcher,
    options
  );

  return result;
};

// Enhanced useSWRMutation with improved logging
export const useSWRMutation = (key: any, fetcher: any, options?: any) => {
  const result = useOriginalSWRMutation(
    key,
    async (url: any, { arg }: { arg: any }) => {
      const verbosity = getVerbosityLevel();
      if (verbosity === 'off') {
        return fetcher(url, { arg });
      }

      const startTime = performance.now();
      const serializedKey = JSON.stringify(key);

      try {
        const result = await fetcher(url, { arg });
        const duration = Math.round(performance.now() - startTime);

        if (verbosity === 'compact') {
          console.log(
            `%c🚀 MUTATION %c${serializedKey} %c→ %c${summarizeData(result)} %c(${duration}ms)`,
            'color: #F59E0B; font-weight: bold',
            'color: #6B7280',
            'color: #F59E0B',
            'color: #10B981',
            'color: #6B7280; font-size: 11px'
          );
        } else if (verbosity === 'detailed') {
          console.groupCollapsed(
            `%c🚀 MUTATION %c${serializedKey} %c→ %c${summarizeData(result)} %c(${duration}ms)`,
            'color: #F59E0B; font-weight: normal',
            'color: #6B7280',
            'color: #F59E0B',
            'color: #10B981',
            'color: #6B7280; font-size: 11px'
          );
          console.log('🔑 Full Key:', key);
          console.log('📦 Full Args:', arg);
          console.log('⏰ Started:', new Date().toLocaleTimeString());
          console.log('✅ Full Result:', result);
          console.log(`⏱️ Duration: ${duration}ms`);
          console.groupEnd();
        }

        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);

        if (verbosity === 'compact') {
          console.error(
            `%c🚀 MUTATION %c${serializedKey} %c→ %c❌ Error %c(${duration}ms)`,
            'color: #F59E0B; font-weight: bold',
            'color: #6B7280',
            'color: #F59E0B',
            'color: #EF4444',
            'color: #6B7280; font-size: 11px'
          );
        } else if (verbosity === 'detailed') {
          console.groupCollapsed(
            `%c🚀 MUTATION %c${serializedKey} %c→ %c❌ Error %c(${duration}ms)`,
            'color: #F59E0B; font-weight: normal',
            'color: #6B7280; font-weight: normal',
            'color: #F59E0B; font-weight: normal',
            'color: #EF4444; font-weight: normal',
            'color: #6B7280; font-weight: normal; font-size: 11px'
          );
          console.log('🔑 Full Key:', key);
          console.log('📦 Full Args:', arg);
          console.log('⏰ Started:', new Date().toLocaleTimeString());
          console.error('❌ Full Error:', error);
          console.log(`⏱️ Duration: ${duration}ms`);
          console.groupEnd();
        }

        throw error;
      }
    },
    options
  );

  return result;
};

// Enhanced useSWRInfinite with improved logging
export const useSWRInfinite = (getKey: any, fetcher?: any, options?: any) => {
  const result = useOriginalSWRInfinite(
    getKey,
    fetcher
      ? async (...args: any[]) => {
          const verbosity = getVerbosityLevel();
          if (verbosity === 'off') {
            return fetcher(...args);
          }

          const startTime = performance.now();
          const pageKey = args[0]; // First arg is the page key
          const serializedKey = JSON.stringify(pageKey);

          try {
            const data = await fetcher(...args);
            const duration = Math.round(performance.now() - startTime);

            if (verbosity === 'compact') {
              console.log(
                `%c📜 INFINITE %c${serializedKey} %c→ %c${summarizeData(data)} %c(${duration}ms)`,
                'color: #10B981; font-weight: normal',
                'color: #6B7280',
                'color: #10B981',
                'color: #059669',
                'color: #6B7280; font-size: 11px'
              );
            } else if (verbosity === 'detailed') {
              console.groupCollapsed(
                `%c📜 INFINITE %c${serializedKey} %c→ %c${summarizeData(data)} %c(${duration}ms)`,
                'color: #10B981; font-weight: normal',
                'color: #6B7280; font-weight: normal',
                'color: #10B981; font-weight: normal',
                'color: #059669; font-weight: normal',
                'color: #6B7280; font-weight: normal; font-size: 11px'
              );
              console.log('🔑 Full Page Key:', pageKey);
              console.log('⏰ Started:', new Date().toLocaleTimeString());
              console.log('✅ Full Data:', data);
              console.log(`⏱️ Duration: ${duration}ms`);
              console.groupEnd();
            }

            return data;
          } catch (error) {
            const duration = Math.round(performance.now() - startTime);

            if (verbosity === 'compact') {
              console.error(
                `%c📜 INFINITE %c${serializedKey} %c→ %c❌ Error %c(${duration}ms)`,
                'color: #10B981; font-weight: bold',
                'color: #6B7280',
                'color: #10B981',
                'color: #EF4444',
                'color: #6B7280; font-size: 11px'
              );
            } else if (verbosity === 'detailed') {
              console.groupCollapsed(
                `%c📜 INFINITE %c${serializedKey} %c→ %c❌ Error %c(${duration}ms)`,
                'color: #10B981; font-weight: normal',
                'color: #6B7280',
                'color: #10B981',
                'color: #EF4444',
                'color: #6B7280; font-size: 11px'
              );
              console.log('🔑 Full Page Key:', pageKey);
              console.log('⏰ Started:', new Date().toLocaleTimeString());
              console.error('❌ Full Error:', error);
              console.log(`⏱️ Duration: ${duration}ms`);
              console.groupEnd();
            }

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
  const verbosity = getVerbosityLevel();
  if (verbosity === 'off') {
    return originalMutate(...args);
  }

  const [key] = args;
  const serializedKey = JSON.stringify(key);

  if (verbosity === 'compact') {
    console.log(
      `%c⚡ GLOBAL MUTATE %c${serializedKey}`,
      'color: #EF4444; font-weight: bold',
      'color: #6B7280'
    );
  } else if (verbosity === 'detailed') {
    console.log(`%c⚡ Global Mutate: ${serializedKey}`, 'color: #EF4444');
  }

  return originalMutate(...args);
};

// Cycle through verbosity levels
const cycleVerbosity = () => {
  const current = getVerbosityLevel();
  let next: VerbosityLevel;

  switch (current) {
    case 'off':
      next = 'compact';
      break;
    case 'compact':
      next = 'detailed';
      break;
    case 'detailed':
      next = 'off';
      break;
    default:
      next = 'compact';
  }

  if (next === 'off') {
    localStorage.removeItem('debug:swr-verbosity');
  } else {
    localStorage.setItem('debug:swr-verbosity', next);
  }

  const colors = {
    off: '#6B7280',
    compact: '#10B981',
    detailed: '#8B5CF6',
  };

  const descriptions = {
    off: 'DISABLED',
    compact: 'COMPACT (with timing)',
    detailed: 'DETAILED (collapsed groups with details)',
  };

  console.log(
    `%c🔄 SWR Logging: ${descriptions[next]}`,
    `color: ${colors[next]}; font-weight: bold`
  );
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
          cycleVerbosity();
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
  (window as any).setSWRVerbosity = (level: VerbosityLevel) => {
    if (level === 'off') {
      localStorage.removeItem('debug:swr-verbosity');
    } else {
      localStorage.setItem('debug:swr-verbosity', level);
    }
    console.log(
      `%c🔄 SWR Verbosity set to: ${level.toUpperCase()}`,
      'color: #0EA5E9; font-weight: bold'
    );
  };

  (window as any).cycleSWRVerbosity = cycleVerbosity;

  // Legacy helpers for compatibility
  (window as any).enableSWRLogging = () => (window as any).setSWRVerbosity('compact');
  (window as any).disableSWRLogging = () => (window as any).setSWRVerbosity('off');

  // Show current verbosity status
  const currentLevel = getVerbosityLevel();

  if (currentLevel !== 'off') {
    const colors = {
      compact: '#10B981',
      detailed: '#8B5CF6',
    };

    const descriptions = {
      compact: 'COMPACT - Single-line logs with timing',
      detailed: 'DETAILED - Collapsed groups with all details',
    };

    console.log(
      `%c🔍 SWR Logging: ${descriptions[currentLevel as keyof typeof descriptions]}`,
      `color: ${colors[currentLevel as keyof typeof colors]}; font-weight: bold`
    );
    console.log('%c   📡 Data fetching: useSWR calls', 'color: #8B5CF6');
    console.log('%c   🔄 Cache mutations: useSWRConfig().mutate calls', 'color: #0EA5E9');
    console.log('%c   🚀 Mutations: useSWRMutation triggers', 'color: #F59E0B');
    console.log('%c   ⚡ Global mutate: Direct mutate() calls', 'color: #EF4444');
    console.log('%c   Press Cmd+Shift+L to cycle verbosity', 'color: #6B7280');
  } else {
    console.log(
      '%c💡 Press Cmd+Shift+L to cycle SWR logging verbosity (Off → Compact → Detailed)',
      'color: #6B7280; font-size: 11px'
    );
  }
}
