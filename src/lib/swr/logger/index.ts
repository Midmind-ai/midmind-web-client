/* eslint-disable no-console */

import { getSWRLoggerConfig, shouldLogKey } from './config';
import { getFormatter } from './formatters';

import type { LogEntry, SWRLoggerConfig } from './types';

export class SWRLogger {
  private getConfig(): SWRLoggerConfig {
    return getSWRLoggerConfig();
  }

  private formatData(data: unknown, formatterName?: string): string {
    const config = this.getConfig();
    const customFormatter = formatterName
      ? config.formatters?.[formatterName]
      : undefined;
    const formatter = customFormatter || getFormatter(formatterName);

    return formatter(data);
  }

  private shouldLog(key: string | 'filter-function'): boolean {
    if (key === 'filter-function') return true; // Always log filter functions

    return shouldLogKey(key);
  }

  private logToConsole(logEntry: LogEntry): void {
    const config = this.getConfig();

    if (config.verbosity === 'basic') {
      this.logBasic(logEntry);
    } else if (config.verbosity === 'detailed') {
      this.logDetailed(logEntry);
    }
  }

  private logBasic(logEntry: LogEntry): void {
    const config = this.getConfig();
    const timestamp = config.showTimestamp
      ? `[${logEntry.timestamp.toLocaleTimeString()}] `
      : '';

    if (logEntry.operation === 'useSWR') {
      console.log(
        `%c${timestamp}%c[SWR]%c useSWR('${logEntry.key}') ${this.formatData(logEntry.before)} → ${this.formatData(logEntry.after)}`,
        'color: inherit; font-weight: normal;', // Timestamp
        'color: #6b7280; font-weight: normal;', // [SWR] - Grey
        'color: #10b981; font-weight: normal;' // useSWR - Green
      );
    } else if (logEntry.operation === 'useSWRInfinite') {
      console.log(
        `%c${timestamp}%c[SWR]%c useSWRInfinite('${logEntry.key}') ${logEntry.metadata?.pages || 0} pages`,
        'color: inherit; font-weight: normal;', // Timestamp
        'color: #6b7280; font-weight: normal;', // [SWR] - Grey
        'color: #3b82f6; font-weight: normal;' // useSWRInfinite - Blue
      );
    } else if (logEntry.operation === 'useSWRMutation') {
      console.log(
        `%c${timestamp}%c[SWR]%c useSWRMutation('${logEntry.key}') triggered`,
        'color: inherit; font-weight: normal;', // Timestamp
        'color: #6b7280; font-weight: normal;', // [SWR] - Grey
        'color: #8b5cf6; font-weight: normal;' // useSWRMutation - Purple
      );
    } else if (logEntry.operation === 'mutate') {
      if (logEntry.key === 'filter-function') {
        console.log(
          `%c${timestamp}%c[SWR]%c mutate(filter) → ${logEntry.metadata?.matchedKeys || 0} keys`,
          'color: inherit; font-weight: normal;', // Timestamp
          'color: #6b7280; font-weight: normal;', // [SWR] - Grey
          'color: #f59e0b; font-weight: normal;' // mutate - Orange
        );
      } else {
        const beforeText =
          logEntry.before !== undefined ? this.formatData(logEntry.before) : '(no cache)';
        const afterText =
          logEntry.after !== undefined ? this.formatData(logEntry.after) : '(no result)';
        console.log(
          `%c${timestamp}%c[SWR]%c mutate('${logEntry.key}') ${beforeText} → ${afterText}`,
          'color: inherit; font-weight: normal;', // Timestamp
          'color: #6b7280; font-weight: normal;', // [SWR] - Grey
          'color: #f59e0b; font-weight: normal;' // mutate - Orange
        );
      }
    }
  }

  private logDetailed(logEntry: LogEntry): void {
    const config = this.getConfig();
    const timestamp = config.showTimestamp
      ? ` [${logEntry.timestamp.toLocaleTimeString()}]`
      : '';

    if (logEntry.operation === 'useSWR') {
      console.groupCollapsed(
        `%c[SWR]%c useSWR('${logEntry.key}')${timestamp}`,
        'color: #6b7280; font-weight: normal;', // [SWR] - Grey
        'color: #10b981; font-weight: normal;' // useSWR - Green
      );
      console.log('%cBEFORE:', 'color: #cccccc');
      console.dir(logEntry.before, { depth: null, colors: true });
      console.log('%cAFTER:', 'color: #cccccc');
      console.dir(logEntry.after, { depth: null, colors: true });
      console.groupEnd();
    } else if (logEntry.operation === 'useSWRInfinite') {
      console.groupCollapsed(
        `%c[SWR]%c useSWRInfinite('${logEntry.key}')${timestamp}`,
        'color: #6b7280; font-weight: normal;', // [SWR] - Grey
        'color: #3b82f6; font-weight: normal;' // useSWRInfinite - Blue
      );
      console.log('%cBEFORE:', 'color: #cccccc');
      console.dir(logEntry.before, { depth: null, colors: true });
      console.log('%cPAGES:', 'color: #cccccc', logEntry.metadata?.pages || 0);
      console.log('%cAFTER:', 'color: #cccccc');
      console.dir(logEntry.after, { depth: null, colors: true });
      console.groupEnd();
    } else if (logEntry.operation === 'useSWRMutation') {
      console.groupCollapsed(
        `%c[SWR]%c useSWRMutation('${logEntry.key}')${timestamp}`,
        'color: #6b7280; font-weight: normal;', // [SWR] - Grey
        'color: #8b5cf6; font-weight: normal;' // useSWRMutation - Purple
      );
      console.log('%cDATA:', 'color: #cccccc');
      console.dir(logEntry.data, { depth: null, colors: true });
      console.log('%cOPTIONS:', 'color: #cccccc');
      console.dir(logEntry.options, { depth: null, colors: true });
      console.log('%cRESULT:', 'color: #cccccc');
      console.dir(logEntry.result, { depth: null, colors: true });
      console.groupEnd();
    } else if (logEntry.operation === 'mutate') {
      if (logEntry.key === 'filter-function') {
        console.groupCollapsed(
          `%c[SWR]%c mutate(filter function)${timestamp}`,
          'color: #6b7280; font-weight: normal;', // [SWR] - Grey
          'color: #f59e0b; font-weight: normal;' // mutate - Orange
        );

        // Show before/after cache states for filter functions
        if (logEntry.before && Array.isArray(logEntry.before)) {
          console.groupCollapsed(`BEFORE (${logEntry.before.length} cache entries)`);
          logEntry.before.forEach((entry: { key: string; value: unknown }) => {
            console.log(`${entry.key}:`);
            console.dir(entry.value, { depth: null, colors: true });
          });
          console.groupEnd();
        }

        if (logEntry.after && Array.isArray(logEntry.after)) {
          console.groupCollapsed(`AFTER (${logEntry.after.length} cache entries)`);
          logEntry.after.forEach((entry: { key: string; value: unknown }) => {
            console.log(`${entry.key}:`);
            console.dir(entry.value, { depth: null, colors: true });
          });
          console.groupEnd();
        }

        console.log('%cDATA/MUTATOR:', 'color: #cccccc');
        console.dir(logEntry.data, { depth: null, colors: true });
        console.log('%cOPTIONS:', 'color: #cccccc');
        console.dir(logEntry.options, { depth: null, colors: true });
        console.log(
          '%cMATCHED KEYS:',
          'color: #cccccc',
          logEntry.metadata?.matchedKeys || 0
        );
        console.groupEnd();
      } else {
        console.groupCollapsed(
          `%c[SWR]%c mutate('${logEntry.key}')${timestamp}`,
          'color: #6b7280; font-weight: normal;', // [SWR] - Grey
          'color: #f59e0b; font-weight: normal;' // mutate - Orange
        );

        // Show cache state changes
        console.log('%cBEFORE:', 'color: #cccccc');
        if (logEntry.before !== undefined) {
          console.dir(logEntry.before, { depth: null, colors: true });
        } else {
          console.log('(no cache)');
        }

        console.log('%cAFTER:', 'color: #cccccc');
        if (logEntry.after !== undefined) {
          console.dir(logEntry.after, { depth: null, colors: true });
        } else {
          console.log('(no result)');
        }

        console.log('%cDATA/MUTATOR:', 'color: #cccccc');
        console.dir(logEntry.data, { depth: null, colors: true });
        console.log('%cOPTIONS:', 'color: #cccccc');
        console.dir(logEntry.options, { depth: null, colors: true });
        console.groupEnd();
      }
    }
  }

  public log(logEntry: LogEntry): void {
    const config = this.getConfig();

    if (!config.enabled || config.verbosity === 'off') {
      return;
    }

    if (!this.shouldLog(logEntry.key)) {
      return;
    }

    if (config.loggerType === 'console') {
      this.logToConsole(logEntry);
    } else if (config.loggerType === 'custom' && config.customLogger) {
      config.customLogger(logEntry);
    }
  }

  // Convenience methods for specific operations
  public logUseSWR(key: string, before: unknown, after: unknown): void {
    this.log({
      operation: 'useSWR',
      key,
      timestamp: new Date(),
      before,
      after,
    });
  }

  public logUseSWRInfinite(
    key: string,
    before: unknown,
    after: unknown,
    pages: number
  ): void {
    this.log({
      operation: 'useSWRInfinite',
      key,
      timestamp: new Date(),
      before,
      after,
      metadata: { pages },
    });
  }

  public logUseSWRMutation(
    key: string,
    data: unknown,
    options: unknown,
    result: unknown
  ): void {
    this.log({
      operation: 'useSWRMutation',
      key,
      timestamp: new Date(),
      data,
      options,
      result,
      metadata: { isMutation: true },
    });
  }

  public logMutate(
    key: string | 'filter-function',
    data: unknown,
    options: unknown,
    result: unknown,
    matchedKeys?: number,
    before?: unknown,
    after?: unknown
  ): void {
    this.log({
      operation: 'mutate',
      key,
      timestamp: new Date(),
      data,
      options,
      result,
      before,
      after,
      metadata:
        key === 'filter-function' ? { matchedKeys, isFilterFunction: true } : undefined,
    });
  }
}

// Singleton instance
let loggerInstance: SWRLogger | null = null;

export const getSWRLogger = (): SWRLogger => {
  if (!loggerInstance) {
    loggerInstance = new SWRLogger();
  }

  return loggerInstance;
};

// Reset singleton for testing
export const resetSWRLogger = (): void => {
  loggerInstance = null;
};
