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
        `${timestamp}[SWR] useSWR('${logEntry.key}') ${this.formatData(logEntry.before)} → ${this.formatData(logEntry.after)}`
      );
    } else if (logEntry.operation === 'useSWRInfinite') {
      console.log(
        `${timestamp}[SWR] useSWRInfinite('${logEntry.key}') ${logEntry.metadata?.pages || 0} pages`
      );
    } else if (logEntry.operation === 'mutate') {
      if (logEntry.key === 'filter-function') {
        console.log(
          `${timestamp}[SWR] mutate(filter) → ${logEntry.metadata?.matchedKeys || 0} keys`
        );
      } else {
        const beforeText =
          logEntry.before !== undefined ? this.formatData(logEntry.before) : '(no cache)';
        const afterText =
          logEntry.after !== undefined ? this.formatData(logEntry.after) : '(no result)';
        console.log(
          `${timestamp}[SWR] mutate('${logEntry.key}') ${beforeText} → ${afterText}`
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
      console.groupCollapsed(`[SWR] useSWR('${logEntry.key}')${timestamp}`);
      console.log('BEFORE:');
      console.dir(logEntry.before, { depth: null, colors: true });
      console.log('AFTER:');
      console.dir(logEntry.after, { depth: null, colors: true });
      console.groupEnd();
    } else if (logEntry.operation === 'useSWRInfinite') {
      console.groupCollapsed(`[SWR] useSWRInfinite('${logEntry.key}')${timestamp}`);
      console.log('BEFORE:');
      console.dir(logEntry.before, { depth: null, colors: true });
      console.log('PAGES:', logEntry.metadata?.pages || 0);
      console.log('AFTER:');
      console.dir(logEntry.after, { depth: null, colors: true });
      console.groupEnd();
    } else if (logEntry.operation === 'mutate') {
      if (logEntry.key === 'filter-function') {
        console.groupCollapsed(`[SWR] mutate(filter function)${timestamp}`);

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

        console.log('DATA:', this.formatData(logEntry.data));
        console.log('OPTIONS:', this.formatData(logEntry.options));
        console.log('MATCHED KEYS:', logEntry.metadata?.matchedKeys || 0);

        if (Array.isArray(logEntry.result)) {
          logEntry.result.forEach((value, index) => {
            console.groupCollapsed(`Result ${index + 1}`);
            console.log('VALUE:', this.formatData(value));
            console.groupEnd();
          });
        }
        console.groupEnd();
      } else {
        console.groupCollapsed(`[SWR] mutate('${logEntry.key}')${timestamp}`);

        // Show before/after data if available
        if (logEntry.before !== undefined || logEntry.after !== undefined) {
          console.log('BEFORE:');
          if (logEntry.before !== undefined) {
            console.dir(logEntry.before, { depth: null, colors: true });
          } else {
            console.log('(no cache)');
          }

          console.log('AFTER:');
          if (logEntry.after !== undefined) {
            console.dir(logEntry.after, { depth: null, colors: true });
          } else {
            console.log('(no result)');
          }
        }

        console.log('DATA:', this.formatData(logEntry.data));
        console.log('OPTIONS:', this.formatData(logEntry.options));
        console.log('RESULT:', this.formatData(logEntry.result));
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
